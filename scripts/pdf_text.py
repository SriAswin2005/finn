"""Shared page-preserving parser for local and Vercel Python runtimes."""
from pypdf import PdfReader
import re


def annual_page_plan(reader, target_pages=None, texts=None):
    """Physical pages only; bookmarks locate MDA without guessing printed offsets."""
    count = len(reader.pages)
    if target_pages:
        return sorted({page - 1 for page in target_pages if 1 <= page <= count}), "targeted physical pages"
    if count <= 100:
        return list(range(count)), None
    outline = []
    def walk(items, depth=0):
        for item in items:
            if isinstance(item, list):
                walk(item, depth + 1)
            else:
                try:
                    outline.append((str(item.get('/Title', '')), reader.get_destination_page_number(item), depth))
                except (KeyError, ValueError, TypeError):
                    pass
    try:
        walk(reader.outline)
    except (KeyError, ValueError, TypeError):
        pass
    mda = []
    for i, (title, start, depth) in enumerate(outline):
        if re.search(r'management\s+discussion|\bMD\s*&?\s*A\b', title, re.I) and start is not None and start >= 0:
            end = next((page for _, page, level in outline[i + 1:] if page is not None and page > start and level <= depth), count)
            mda.extend(range(start, min(end, start + 40, count)))
    if not mda:
        # Contents numbers are hints, never citations. Accept a candidate only
        # after its actual physical page starts with the MDA section heading.
        for index in range(min(40, count)):
            contents = texts[index] if texts and index in texts else reader.pages[index].extract_text() or ""
            heading = re.search(r'management\s+discussion(?:\s+(?:and|&)\s+analysis)?', contents, re.I)
            if not heading:
                continue
            before = re.search(r'(?:^|\n)\s*(\d{1,3})\s*$', contents[:heading.start()])
            after = re.match(r'[^\d]{0,60}(\d{1,3})\b', contents[heading.end():])
            hint = before or after
            if not hint:
                continue
            printed = int(hint.group(1))
            next_section = re.search(r'(?:^|\n)\s*(\d{1,3})\s+[A-Za-z]', contents[heading.end():])
            length = min(24, int(next_section.group(1)) - printed) if next_section and int(next_section.group(1)) > printed else 24
            # Cover/annexure offsets are candidate hints, verified against the
            # actual physical heading before any page is selected or cited.
            offsets = list(dict.fromkeys([max(0, index - 1), index, max(0, index - 2), *range(41)]))
            for offset in offsets:
                candidate = printed - 1 + offset
                if not 8 <= candidate < count:
                    continue
                header = (reader.pages[candidate].extract_text() or "")[:800]
                if re.search(r'management\s+discussion\s+(?:and|&)\s+analysis', header, re.I) and not re.search(r'contents', header, re.I):
                    mda = list(range(candidate, min(candidate + length, count)))
                    break
            if mda:
                break
    # The extractor streams the overview first, then this bounded MDA section.
    plan = list(dict.fromkeys([*range(10), *mda[:40], *range(10, 40)]))
    return plan, "overview and located MDA (bounded section)" if mda else "overview; MDA not located within scan budget"


def extract_pages(source, *, bounded_annual=False, target_pages=None, emit=None):
    reader = PdfReader(source, strict=False)
    if reader.is_encrypted and not reader.decrypt(""):
        raise ValueError("Password-protected document")
    if len(reader.pages) > 800:
        raise ValueError("Document exceeds the 800-page prototype limit")
    pages = []
    total = 0
    large = bounded_annual and len(reader.pages) > 100 and not target_pages
    plan, selection = (list(range(40)), "overview; MDA lookup pending") if large else annual_page_plan(reader, target_pages) if bounded_annual else (list(range(len(reader.pages))), None)
    texts = {}
    metadata = {"parser": "pypdf-6.10.0-v2", "pageCount": len(reader.pages),
                "partialScan": len(plan) < len(reader.pages), "scanSelection": selection}
    if emit:
        emit({"metadata": metadata})
    def indices():
        yield from plan
        if large:
            remaining, selected = annual_page_plan(reader, texts=texts)
            metadata["scanSelection"] = selected
            if emit:
                emit({"metadata": metadata})
            yield from (index for index in remaining if index >= 40)
    for index in indices():
        page = reader.pages[index]
        original = page.extract_text() or ""
        texts[index] = original
        text = " ".join(original.split())
        total += len(text)
        if total > 4_000_000:
            raise ValueError("Extracted document exceeds the text-size limit")
        try:
            layout = "" if bounded_annual else page.extract_text(extraction_mode="layout", layout_mode_space_vertically=False) or ""
        except (KeyError, ValueError, TypeError):
            layout = ""  # A blank/broken layout never repairs or replaces text.
        # Some malformed font geometries create megabytes of whitespace. Keep
        # original text and expose the layout limit rather than repair cells.
        layout_limited = len(layout) > 200_000 or bool(text and not layout)
        links = []
        for annotation in page.get("/Annots", []):
            try:
                action = annotation.get_object().get("/A", {})
                uri = action.get("/URI")
                if isinstance(uri, str) and uri.startswith("https://"):
                    links.append(uri)
            except (KeyError, TypeError, ValueError):
                pass
        pages.append({"page": index + 1, "text": text, "originalText": original, "links": links[:30],
                      "layoutText": "" if layout_limited else layout,
                      "layoutLimited": layout_limited})
        if emit:
            emit({"page": pages[-1]})
    if total < 200:
        raise ValueError("Unreadable PDF: no usable text layer; OCR is not enabled")
    # Preserve the legacy local shape/hash; hosted metadata explicitly describes coverage.
    return {**(metadata if bounded_annual else {"parser": metadata["parser"]}),
            "pages": sorted(pages, key=lambda page: page["page"]),
            **({"scannedPageCount": len(pages)} if bounded_annual else {})}

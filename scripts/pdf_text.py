"""Shared page-preserving parser for local and Vercel Python runtimes."""
from pypdf import PdfReader


def extract_pages(source):
    reader = PdfReader(source, strict=False)
    if reader.is_encrypted and not reader.decrypt(""):
        raise ValueError("Password-protected document")
    if len(reader.pages) > 800:
        raise ValueError("Document exceeds the 800-page prototype limit")
    pages = []
    total = 0
    for index, page in enumerate(reader.pages):
        original = page.extract_text() or ""
        text = " ".join(original.split())
        total += len(text)
        if total > 4_000_000:
            raise ValueError("Extracted document exceeds the text-size limit")
        try:
            layout = page.extract_text(extraction_mode="layout", layout_mode_space_vertically=False) or ""
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
    if total < 200:
        raise ValueError("Unreadable PDF: no usable text layer; OCR is not enabled")
    return {"parser": "pypdf-6.10.0-v2", "pages": pages}

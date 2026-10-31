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
        text = " ".join((page.extract_text() or "").split())
        total += len(text)
        if total > 4_000_000:
            raise ValueError("Extracted document exceeds the text-size limit")
        pages.append({"page": index + 1, "text": text})
    if total < 200:
        raise ValueError("Unreadable PDF: no usable text layer; OCR is not enabled")
    return {"parser": "pypdf-6.10.0-v1", "pages": pages}

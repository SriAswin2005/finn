"""Bounded, page-preserving extraction. No financial inference or network access."""
import json
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding="utf-8")
try:
    reader = PdfReader(sys.argv[1], strict=False)
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
        raise ValueError("Document has no usable text layer; OCR is not enabled")
    print(json.dumps({"parser": "pypdf-6.10.0-v1", "pages": pages}, ensure_ascii=False))
except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)

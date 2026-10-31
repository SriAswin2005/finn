"""Bounded, page-preserving extraction. No financial inference or network access."""
import json
import sys
from pdf_text import extract_pages

sys.stdout.reconfigure(encoding="utf-8")
try:
    print(json.dumps(extract_pages(sys.argv[1]), ensure_ascii=False))
except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)

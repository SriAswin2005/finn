import hashlib
import hmac
import json
import unittest
import subprocess
import sys
import time
from unittest.mock import patch
from io import BytesIO
from pypdf import PdfWriter
from api.parse import verify_payload, public_target, bounded_annual_report
from scripts.pdf_text import extract_pages, annual_page_plan


class HostedParserTest(unittest.TestCase):
    def test_large_annual_plan_prioritizes_overview_and_physical_mda(self):
        class Reader:
            pages = [None] * 350
            outline = [{"/Title": "Management Discussion and Analysis", "page": 120},
                       {"/Title": "Statutory notes", "page": 145}]
            def get_destination_page_number(self, item):
                return item["page"]
        plan, selection = annual_page_plan(Reader())
        self.assertTrue(set(range(40)).issubset(plan))
        self.assertTrue(set(range(120, 145)).issubset(plan))
        self.assertNotIn(145, plan)
        self.assertEqual(plan[10], 120)
        self.assertIn("MDA", selection)
        self.assertEqual(annual_page_plan(Reader(), [220, 5, 220])[0], [4, 219])

    def test_hosted_watchdog_keeps_completed_physical_pages_and_kills_slow_worker(self):
        records = [{"metadata": {"sha256": "a" * 64, "pageCount": 350, "partialScan": True}},
                   {"page": {"page": 7, "text": "Original evidence. " * 30}}]
        code = "import sys,time;sys.stdout.buffer.write(" + repr(b"\n".join(json.dumps(r).encode() for r in records) + b"\n") + ");sys.stdout.buffer.flush();time.sleep(10)"
        real_popen = subprocess.Popen
        with patch("api.parse.subprocess.Popen", side_effect=lambda *args, **kwargs: real_popen([sys.executable, "-c", code], **kwargs)):
            start = time.monotonic()
            result = bounded_annual_report({}, timeout=0.7)
        self.assertLess(time.monotonic() - start, 2)
        self.assertEqual([p["page"] for p in result["pages"]], [7])
        self.assertEqual(result["pageCount"], 350)
        self.assertTrue(result["partialScan"])
        self.assertTrue(result["scanLimitedByTime"])

    def test_contents_on_physical_page_25_uses_verified_mda_not_printed_page_number(self):
        class Page:
            def __init__(self, text="Ordinary overview"):
                self.text = text
            def extract_text(self):
                return self.text
        class Reader:
            outline = []
            pages = [Page() for _ in range(485)]
        reader = Reader()
        reader.pages[24] = Page("Contents\n79 Management Discussion\nand Analysis (MDA)\n126 Directors' Report")
        reader.pages[101] = Page("Management Discussion and Analysis\nIndustry outlook")
        plan, selection = annual_page_plan(reader)
        self.assertIn(101, plan)
        self.assertNotIn(78, plan)  # Printed79 is not assumed to be physical79.
        self.assertIn("MDA", selection)

    def test_signed_expiring_request(self):
        secret = "test-only-secret"
        body = json.dumps({"url": "https://issuer.example/a.pdf", "expires": 150, "maxBytes": 25_000_000}).encode()
        signature = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        self.assertEqual(verify_payload(body, signature, secret, now=100)["expires"], 150)
        for signed, key, now in [("bad", secret, 100), (signature, "", 100), (signature, secret, 151), (signature, secret, 1)]:
            with self.assertRaises(PermissionError):
                verify_payload(body, signed, key, now=now)

    def test_public_dns_and_https(self):
        public = lambda *args, **kwargs: [(None, None, None, None, ("8.8.8.8", 443))]
        private = lambda *args, **kwargs: [(None, None, None, None, ("127.0.0.1", 443))]
        self.assertEqual(public_target("https://issuer.example/report.pdf", public)[1], "8.8.8.8")
        for url in ["http://issuer.example/a.pdf", "https://127.0.0.1/a.pdf", "https://u:p@issuer.example/a.pdf", "https://issuer.example:8443/a.pdf"]:
            with self.assertRaises(ValueError):
                public_target(url, public)
        with self.assertRaises(ValueError):
            public_target("https://issuer.example/a.pdf", private)

    def test_scanned_or_blank_pdf_is_unreadable(self):
        writer = PdfWriter()
        writer.add_blank_page(width=100, height=100)
        document = BytesIO()
        writer.write(document)
        document.seek(0)
        with self.assertRaisesRegex(ValueError, "Unreadable PDF"):
            extract_pages(document)

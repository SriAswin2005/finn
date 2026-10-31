import hashlib
import hmac
import json
import unittest
from io import BytesIO
from pypdf import PdfWriter
from api.parse import verify_payload, public_target
from scripts.pdf_text import extract_pages


class HostedParserTest(unittest.TestCase):
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

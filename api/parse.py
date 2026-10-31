"""Private bounded PDF parser. Receives a signed source URL, never uploaded PDFs."""
from http.server import BaseHTTPRequestHandler
from http.client import HTTPSConnection
from io import BytesIO
import hashlib
import hmac
import ipaddress
import json
import os
import socket
import ssl
import time
from urllib.parse import urlsplit, urljoin
from scripts.pdf_text import extract_pages


def verify_payload(body, signature, secret, now=None):
    if not secret or not hmac.compare_digest(hmac.new(secret.encode(), body, hashlib.sha256).hexdigest(), signature):
        raise PermissionError("Private parser authorization required")
    payload = json.loads(body)
    now = time.time() if now is None else now
    expiry = payload.get("expires", 0)
    if not isinstance(expiry, (int, float)) or not now < expiry <= now + 90:
        raise PermissionError("Parser request expired")
    if payload.get("maxBytes") not in (25_000_000, 50_000_000):
        raise ValueError("Invalid document limit")
    return payload


def public_target(url, resolver=socket.getaddrinfo):
    target = urlsplit(url)
    if target.scheme != "https" or target.username or target.password or target.port not in (None, 443) or not target.hostname or "." not in target.hostname:
        raise ValueError("Only public HTTPS document URLs are allowed")
    try:
        ipaddress.ip_address(target.hostname)
    except ValueError:
        pass
    else:
        raise ValueError("IP-literal document URLs are not allowed")
    addresses = resolver(target.hostname, 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(row[4][0]).is_global for row in addresses):
        raise ValueError("Private document addresses are not allowed")
    return target, addresses[0][4][0]


def download_pdf(url, max_bytes, resolver=socket.getaddrinfo):
    deadline = time.monotonic() + 25
    for redirect in range(4):
        target, address = public_target(url, resolver)
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise ValueError("Document download timed out")
        # Pin the validated address while retaining TLS hostname verification and SNI.
        connection = HTTPSConnection(target.hostname, timeout=remaining)
        raw = socket.create_connection((address, 443), timeout=remaining)
        connection.sock = ssl.create_default_context().wrap_socket(raw, server_hostname=target.hostname)
        try:
            path = target.path or "/"
            if target.query:
                path += "?" + target.query
            connection.request("GET", path, headers={"User-Agent": "Mozilla/5.0 (compatible; FINNPrototype/0.3)", "Accept": "application/pdf"})
            response = connection.getresponse()
            if response.status in (301, 302, 303, 307, 308):
                location = response.getheader("Location")
                if not location or redirect == 3:
                    raise ValueError("Document redirect limit exceeded")
                url = urljoin(url, location)
                continue
            if response.status != 200:
                raise ValueError(f"Document source returned HTTP {response.status}")
            if int(response.getheader("Content-Length", "0")) > max_bytes:
                raise ValueError("Document exceeds the size limit")
            chunks = []
            size = 0
            while True:
                if time.monotonic() > deadline:
                    raise ValueError("Document download timed out")
                chunk = response.read(65536)
                if not chunk:
                    break
                size += len(chunk)
                if size > max_bytes:
                    raise ValueError("Document exceeds the size limit")
                chunks.append(chunk)
            body = b"".join(chunks)
            if not body.startswith(b"%PDF-"):
                raise ValueError("The source did not return a PDF")
            return body, url
        finally:
            connection.close()
    raise ValueError("Document redirect limit exceeded")


class handler(BaseHTTPRequestHandler):
    def respond(self, status, value):
        payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        self.respond(405, {"error": "Private parser accepts signed POST only."})

    def do_POST(self):
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if size < 1 or size > 2048:
                return self.respond(413, {"error": "Parser request size is invalid."})
            body = self.rfile.read(size)
            payload = verify_payload(body, self.headers.get("x-finn-parser-signature", ""), os.environ.get("FINN_PARSER_SECRET", ""))
            pdf, url = download_pdf(payload["url"], payload["maxBytes"])
            result = {**extract_pages(BytesIO(pdf)), "sha256": hashlib.sha256(pdf).hexdigest(), "url": url}
            if len(json.dumps(result).encode("utf-8")) > 4_000_000:
                raise ValueError("Extracted PDF exceeds the hosted response limit")
            self.respond(200, result)
        except PermissionError:
            self.respond(403, {"error": "Private parser authorization required or expired."})
        except Exception:
            self.respond(503, {"error": "Unreadable or unavailable PDF: download/text extraction failed or exceeded its limits. Scanned PDFs need OCR, which is not enabled."})

    def log_message(self, *args):
        pass  # Do not log signed request material or source URL query strings.

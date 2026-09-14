"""Security Headers & Secure File Upload Validator (EPIC 24).

Hardens API endpoints against security vulnerabilities by injecting protective
security headers and validating uploaded file payloads against magic byte signatures.
"""

import os
from collections.abc import Callable

from fastapi import HTTPException, Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MAGIC_BYTES = [
    b"\xff\xd8\xff",  # JPEG / JPG
    b"\x89PNG\r\n\x1a\n",  # PNG
    b"RIFF",  # WEBP container (starts with RIFF)
]


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for injecting defensive HTTP security headers."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response: Response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        return response


def validate_uploaded_file(
    filename: str, file_bytes: bytes, max_size_mb: float = 10.0
) -> bool:
    """Validates uploaded image file extension, maximum file size, and magic byte headers."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    max_bytes = int(max_size_mb * 1024 * 1024)
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {max_size_mb}MB.",
        )

    # Magic Bytes Signature Verification
    if not any(file_bytes.startswith(magic) for magic in ALLOWED_MAGIC_BYTES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content signature validation failed. Uploaded payload is not a valid image.",
        )

    return True

"""Rate Limiting Middleware (EPIC 24).

Implements IP-based sliding window rate limiting to protect API endpoints
from abuse, resource exhaustion, and AI endpoint spam.
"""

import time
from collections.abc import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

# In-memory sliding window request store: client_ip -> list of timestamps
_REQUEST_TIMESTAMPS: dict[str, list[float]] = {}


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Middleware for enforcing API rate limits per client IP."""

    def __init__(
        self,
        app: Callable,
        default_limit: int = 100,
        ai_limit: int = 20,
        window_seconds: int = 60,
    ):
        super().__init__(app)
        self.default_limit = default_limit
        self.ai_limit = ai_limit
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "127.0.0.1"
        path = request.url.path

        # Determine limit based on endpoint path
        limit = self.ai_limit if "/api/ai-assistant" in path else self.default_limit

        now = time.time()
        window_start = now - self.window_seconds

        # Retrieve & clean request timestamps within current sliding window
        timestamps = [
            t for t in _REQUEST_TIMESTAMPS.get(client_ip, []) if t > window_start
        ]

        if len(timestamps) >= limit:
            reset_time = int(self.window_seconds - (now - timestamps[0]))
            return JSONResponse(
                status_code=429,
                content={
                    "status": "error",
                    "message": f"Rate limit exceeded ({limit} requests/{self.window_seconds}s). Try again in {reset_time} seconds.",
                    "code": 429,
                },
                headers={
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_time),
                    "Retry-After": str(reset_time),
                },
            )

        # Record current request timestamp
        timestamps.append(now)
        _REQUEST_TIMESTAMPS[client_ip] = timestamps

        response: Response = await call_next(request)
        remaining = max(0, limit - len(timestamps))

        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(self.window_seconds)

        return response

"""Performance Monitoring Middleware (EPIC 24).

Measures HTTP request execution latency in milliseconds, injects `X-Process-Time`
headers into HTTP responses, and logs warning alerts for requests exceeding 500ms.
"""

import time
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for tracking request execution duration and enforcing latency SLAs."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        response: Response = await call_next(request)
        execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        # Inject SLA latency metric header
        response.headers["X-Process-Time"] = f"{execution_time_ms}ms"

        # Log SLA warning if p95 target (500ms) is exceeded
        if execution_time_ms > 500.0:
            print(
                f"[LankaLens SLA Warning] Request to '{request.method} {request.url.path}' "
                f"took {execution_time_ms}ms (Target: <=500ms)"
            )

        return response

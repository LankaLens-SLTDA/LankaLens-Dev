"""Standardized Exception Handlers (EPIC 24).

Catches uncaught exceptions and validation errors, ensuring API responses maintain
a consistent, non-sensitive JSON error format across all environments.
"""

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "code": exc.status_code,
        },
        headers=getattr(exc, "headers", None),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = exc.errors()
    formatted_message = (
        f"Validation error: {errors[0]['msg']} at '{'.'.join(str(x) for x in errors[0]['loc'])}'"
        if errors
        else "Invalid payload structure"
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": formatted_message,
            "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "details": errors,
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    print(f"[LankaLens Unhandled Exception Log] Path '{request.url.path}': {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An internal server error occurred. Please try again later.",
            "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
    )

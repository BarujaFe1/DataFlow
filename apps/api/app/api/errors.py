"""Structured error handling.

Every error returned to a client is a JSON ``ErrorResponse`` with a stable
``code``, a safe public ``message``, and a ``request_id`` for tracing. Internal
exception detail (stack traces) is NEVER exposed to clients.
"""

import uuid

from fastapi import Request
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse

from app.models.schemas import ErrorResponse, ErrorDetail


class AppError(Exception):
    def __init__(
        self,
        status_code: int = 400,
        code: str = "BAD_REQUEST",
        message: str = "",
        detail: str = None,
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.detail = detail


def _body(code: str, message: str, request_id: str, detail=None) -> dict:
    return ErrorResponse(
        error=ErrorDetail(code=code, message=message, request_id=request_id, detail=detail)
    ).model_dump()


def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    rid = uuid.uuid4().hex
    return JSONResponse(
        status_code=exc.status_code,
        content=_body(exc.code, exc.message, rid, exc.detail),
    )


def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    rid = uuid.uuid4().hex
    return JSONResponse(
        status_code=exc.status_code,
        content=_body(f"HTTP_{exc.status_code}", str(exc.detail), rid),
    )


def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    rid = uuid.uuid4().hex
    return JSONResponse(
        status_code=500,
        content=_body(
            "INTERNAL_ERROR",
            "Erro interno do servidor. Nenhuma informação de implementação é exposta.",
            rid,
        ),
    )

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import (
    AppError,
    app_error_handler,
    http_exception_handler,
    unhandled_exception_handler,
)
from app.api.routes import router
from app.core import security as sec

app = FastAPI(
    title="DataFlow API",
    description=(
        "Backend analítico para profiling, limpeza e testes estatísticos do DataFlow "
        "— um laboratório explicável de qualidade de dados tabulares."
    ),
    version="1.0.0",
)

# CORS: explicit, environment-driven. Never wildcard + credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=sec.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured errors: stable codes + request_id; never leak stack traces.
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
try:
    from fastapi.exceptions import HTTPException

    app.add_exception_handler(HTTPException, http_exception_handler)
except Exception:
    pass

app.include_router(router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo à API do DataFlow",
        "health_check": "/api/health",
        "docs": "/docs",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

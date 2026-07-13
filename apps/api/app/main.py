import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI(
    title="DataFlow API",
    description="Backend analítico para profiling, limpeza e testes estatísticos do DataFlow",
    version="1.1.0"
)

# CORS: allow browser demos without invalid "*"+credentials combo
_DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dataflow-sand.vercel.app",
]
_extra = os.getenv("DATAFLOW_CORS_ORIGINS", "").strip()
_origins = [o.strip() for o in _extra.split(",") if o.strip()] if _extra else _DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo à API do DataFlow",
        "health_check": "/api/health",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

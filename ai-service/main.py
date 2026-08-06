"""
TUT Academic Risk Early Warning – Python FastAPI AI Service
Start: uvicorn main:app --reload --port 8000
Docs:  http://localhost:8000/docs
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.routes import risk, health

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("tut_rew")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = settings.APP_NAME,
    description = (
        "AI Risk Analysis Engine for Tshwane University of Technology. "
        "Called exclusively by the Node.js backend – not directly by the browser."
    ),
    version     = settings.APP_VERSION,
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS – only the Node.js backend may call this service ────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins  = [settings.NODE_BACKEND_URL],
    allow_methods  = ["GET", "POST"],
    allow_headers  = ["*"],
)

# ── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal AI service error. Check service logs."},
    )

# ── Startup log ──────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("✅  %s v%s started on port %s", settings.APP_NAME, settings.APP_VERSION, settings.PORT)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(risk.router,   prefix="/risk",   tags=["Risk Analysis"])

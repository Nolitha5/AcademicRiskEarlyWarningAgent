from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/")
def health_check():
    return {
        "status":  "ok",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }

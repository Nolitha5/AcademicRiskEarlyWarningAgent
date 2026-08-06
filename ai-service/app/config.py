"""
Application settings – loaded from environment variables via pydantic-settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Service identity
    APP_NAME: str = "TUT REW AI Service"
    APP_VERSION: str = "0.1.0"
    PORT: int = 8000
    DEBUG: bool = False

    # Node.js backend (for future bi-directional calls if needed)
    NODE_BACKEND_URL: str = "http://localhost:3001"

    # Risk score thresholds (tweak without touching analyser logic)
    HIGH_RISK_THRESHOLD: int = 70
    MEDIUM_RISK_THRESHOLD: int = 35

    # Rule weight overrides (optional – default weights live in risk_rules.py)
    # Set these in .env to tune without code changes, e.g. WEIGHT_AVERAGE_BELOW_40=35


settings = Settings()

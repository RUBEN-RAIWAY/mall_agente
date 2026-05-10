from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    openai_api_key: str
    tavily_api_key: str
    firebase_project_id: str
    # File path (local dev) or inline JSON string (production/Railway)
    google_application_credentials: str = "./firebase-service-account.json"
    firebase_service_account_json: Optional[str] = None
    # CORS: comma-separated list of allowed origins
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()

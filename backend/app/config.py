import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoReason - Biodiversity Decision Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    
    # AI & Retrieval
    GEMINI_API_KEY: Optional[str] = None
    ALLOW_MOCK_FALLBACK: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./ecoreason.db"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

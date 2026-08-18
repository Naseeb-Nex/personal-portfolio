from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Portfolio Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = "change_me_in_production"
    
    # External APIs
    GEMINI_API_KEY: str | None = None
    GEMINI_MODELS: list[str] = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]
    
    # Store API keys in .env as a JSON list or comma separated. 
    # For simplicity, we can accept a string and split it, or use pydantic's list parsing.
    GEMINI_FALLBACK_API_KEYS: list[str] = []
    
    DATABASE_URL: str | None = None
    REDIS_URL: str | None = None
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

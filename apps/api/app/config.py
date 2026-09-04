import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "VentureForge AI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DATA_DIR}/ventureforge.db")
    
    # AI Providers
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic") # "gemini", "openai", "anthropic", "deterministic"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Vector store
    EMBEDDING_DIMENSION: int = 384
    MAX_CHUNKS_PER_DOC_RETRIEVAL: int = 2
    DEFAULT_TOP_K: int = 6
    
    # Storage
    UPLOAD_PATH: Path = UPLOAD_DIR
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

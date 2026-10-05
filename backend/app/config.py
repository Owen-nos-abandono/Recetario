"""
Configuración central de la aplicación.
Todos los valores sensibles se leen de variables de entorno (.env)
NUNCA se deben hardcodear secretos en el código.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "Recetario API"
    ENVIRONMENT: str = "development"  # development | production

    # --- Base de datos ---
    DATABASE_URL: str = "sqlite:///./recetario.db"

    # --- Seguridad / JWT ---
    SECRET_KEY: str  # obligatorio, generar con: openssl rand -hex 32
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Bloqueo de cuenta por intentos fallidos de login ---
    LOGIN_MAX_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15

    # --- CORS ---
    ALLOWED_ORIGINS: str = "http://localhost:4200"

    class Config:
        env_file = ".env"
        extra = "ignore"  # ignora variables viejas del .env (RESEND_API_KEY, OTP_*, etc.)

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://tiltil:tiltil_dev@localhost:5432/portal_instalacion"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://tiltil:tiltil_dev@localhost:5432/portal_instalacion"

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    EMPRESA_CODIGO: str = "999"
    EMPRESA_NOMBRE: str = "Empresa Electrica Municipal de TilTil"


settings = Settings()

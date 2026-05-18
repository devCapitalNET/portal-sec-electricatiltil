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

    UPLOADS_DIR: str = "/app/uploads"
    MAX_UPLOAD_MB: int = 20
    ALLOWED_MIME: list[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
        "application/vnd.ms-excel",
        "application/zip",
        "text/plain",
    ]

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    SMTP_FROM: str = "no-reply@electricatiltil.cl"
    SMTP_FROM_NAME: str = "Electrica TilTil"
    ADMIN_NOTIFY_EMAIL: str = "admin@tiltil.cl"
    PORTAL_PUBLIC_URL: str = "http://localhost:3000"


settings = Settings()

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
RUN pip install --upgrade pip && pip install \
    fastapi==0.115.6 \
    "uvicorn[standard]==0.32.1" \
    sqlalchemy==2.0.36 \
    asyncpg==0.30.0 \
    psycopg2-binary==2.9.10 \
    alembic==1.14.0 \
    pydantic==2.10.4 \
    pydantic-settings==2.7.0 \
    "python-jose[cryptography]==3.3.0" \
    bcrypt==4.2.1 \
    python-multipart==0.0.20 \
    email-validator==2.2.0 \
    httpx==0.28.1 \
    pytest==8.3.4 \
    pytest-asyncio==0.25.0

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

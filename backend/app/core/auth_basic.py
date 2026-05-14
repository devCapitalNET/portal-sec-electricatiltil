"""HTTP Basic auth para consumidores del Web Service SEC (Anexo Tecnico N1)."""

import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.database import get_db
from app.models import SecCredential

security = HTTPBasic()


async def require_sec_basic_auth(
    credentials: HTTPBasicCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> SecCredential:
    """Valida usuario/contrasena Basic Auth contra tabla sec_credentials."""
    result = await db.execute(
        select(SecCredential).where(
            SecCredential.username == credentials.username,
            SecCredential.activa.is_(True),
        )
    )
    cred = result.scalar_one_or_none()

    valid = False
    if cred is not None and verify_password(credentials.password, cred.password_hash):
        # secrets.compare_digest para evitar timing attacks en el path final
        valid = secrets.compare_digest(credentials.username, cred.username)

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas",
            headers={"WWW-Authenticate": "Basic"},
        )
    return cred

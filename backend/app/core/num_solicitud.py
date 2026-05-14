"""Generador de NUMSOLICITUD con formato YYYY-{FT|CNX}-NNNNN."""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import TipoTramite
from app.models import Solicitud


async def next_num_solicitud(db: AsyncSession, tipo_tramite: str) -> str:
    prefix = "FT" if tipo_tramite == TipoTramite.FACTIBILIDAD else "CNX"
    year = date.today().year
    pattern = f"{year}-{prefix}-%"
    result = await db.execute(
        select(func.count(Solicitud.id)).where(Solicitud.num_solicitud.like(pattern))
    )
    count = result.scalar_one() or 0
    return f"{year}-{prefix}-{count + 1:05d}"

"""Web Service SEC - Solicitudes de Factibilidad Tecnica (Anexo 1 seccion 1).

Endpoints:
  POST /consultarSolicitudFactibilidad        (por NUMSOLICITUD)
  POST /consultarFechaIngresoFactibilidad     (por FECHAINGRESO)
  POST /consultarFechaTerminoFactibilidad     (por FECHATERMINOINGRESO)
  POST /consultarRUNRUTFactibilidad           (por RUT_RUN)

Todos requieren HTTP Basic Auth.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_basic import require_sec_basic_auth
from app.core.enums import TipoTramite
from app.core.mapping import solicitud_to_factibilidad_dict
from app.database import get_db
from app.models import Solicitud
from app.schemas.sec_in import (
    ConsultaFechaIngresoIn,
    ConsultaFechaTerminoIn,
    ConsultaNumSolicitudIn,
    ConsultaRutIn,
)

router = APIRouter(dependencies=[Depends(require_sec_basic_auth)])


@router.post("/consultarSolicitudFactibilidad", summary="Consulta por NUMSOLICITUD")
async def consultar_solicitud_factibilidad(
    body: ConsultaNumSolicitudIn,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.num_solicitud == body.NUMSOLICITUD,
            Solicitud.tipo_tramite == TipoTramite.FACTIBILIDAD,
        )
    )
    sol = result.scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return solicitud_to_factibilidad_dict(sol)


@router.post("/consultarFechaIngresoFactibilidad", summary="Consulta por fecha de ingreso")
async def consultar_fecha_ingreso_factibilidad(
    body: ConsultaFechaIngresoIn,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.tipo_tramite == TipoTramite.FACTIBILIDAD,
            Solicitud.fecha_ingreso == body.FECHAINGRESO,
        )
    )
    rows = result.scalars().all()
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitudes no encontradas")
    return [solicitud_to_factibilidad_dict(s) for s in rows]


@router.post("/consultarFechaTerminoFactibilidad", summary="Consulta por fecha de termino")
async def consultar_fecha_termino_factibilidad(
    body: ConsultaFechaTerminoIn,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.tipo_tramite == TipoTramite.FACTIBILIDAD,
            Solicitud.fecha_respuesta_empresa == body.FECHATERMINOINGRESO,
        )
    )
    rows = result.scalars().all()
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitudes no encontradas")
    return [solicitud_to_factibilidad_dict(s) for s in rows]


@router.post("/consultarRUNRUTFactibilidad", summary="Consulta por RUN/RUT")
async def consultar_runrut_factibilidad(
    body: ConsultaRutIn,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.tipo_tramite == TipoTramite.FACTIBILIDAD,
            (Solicitud.requirente_rut == body.RUT_RUN) | (Solicitud.propietario_rut == body.RUT_RUN),
        )
    )
    rows = result.scalars().all()
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitudes no encontradas")
    return [solicitud_to_factibilidad_dict(s) for s in rows]

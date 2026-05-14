"""Web Service SEC - Solicitudes de Conexion o Ampliacion (Anexo 1 seccion 2).

Endpoints:
  POST /consultarNumSolicitud                (por NUMSOLICITUD)
  POST /consultarSolicitudPorFechaIngreso    (por FECHAINGRESO)
  POST /consultarFechaTerminoSolicitud       (por FECHATERMINOINGRESO)
  POST /consultarRUNRUTConexion              (por RUT_RUN)

Todos requieren HTTP Basic Auth.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_basic import require_sec_basic_auth
from app.core.enums import TipoTramite
from app.core.mapping import solicitud_to_conexion_dict
from app.database import get_db
from app.models import Solicitud
from app.schemas.sec_in import (
    ConsultaFechaIngresoIn,
    ConsultaFechaTerminoIn,
    ConsultaNumSolicitudIn,
    ConsultaRutIn,
)

router = APIRouter(dependencies=[Depends(require_sec_basic_auth)])


@router.post("/consultarNumSolicitud", summary="Consulta por NUMSOLICITUD")
async def consultar_num_solicitud(
    body: ConsultaNumSolicitudIn,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.num_solicitud == body.NUMSOLICITUD,
            Solicitud.tipo_tramite == TipoTramite.CONEXION,
        )
    )
    sol = result.scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return solicitud_to_conexion_dict(sol)


@router.post("/consultarSolicitudPorFechaIngreso", summary="Consulta por fecha de ingreso")
async def consultar_por_fecha_ingreso(
    body: ConsultaFechaIngresoIn,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.tipo_tramite == TipoTramite.CONEXION,
            Solicitud.fecha_ingreso == body.FECHAINGRESO,
        )
    )
    rows = result.scalars().all()
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitudes no encontradas")
    return [solicitud_to_conexion_dict(s) for s in rows]


@router.post("/consultarFechaTerminoSolicitud", summary="Consulta por fecha de termino")
async def consultar_fecha_termino_solicitud(
    body: ConsultaFechaTerminoIn,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.tipo_tramite == TipoTramite.CONEXION,
            Solicitud.fecha_respuesta_empresa == body.FECHATERMINOINGRESO,
        )
    )
    rows = result.scalars().all()
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitudes no encontradas")
    return [solicitud_to_conexion_dict(s) for s in rows]


@router.post("/consultarRUNRUTConexion", summary="Consulta por RUN/RUT")
async def consultar_runrut_conexion(
    body: ConsultaRutIn,
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    result = await db.execute(
        select(Solicitud).where(
            Solicitud.tipo_tramite == TipoTramite.CONEXION,
            (Solicitud.requirente_rut == body.RUT_RUN) | (Solicitud.propietario_rut == body.RUT_RUN),
        )
    )
    rows = result.scalars().all()
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitudes no encontradas")
    return [solicitud_to_conexion_dict(s) for s in rows]

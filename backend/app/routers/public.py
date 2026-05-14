"""Endpoints publicos (sin auth) para el formulario de Requirente."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import TipoTramite
from app.core.num_solicitud import next_num_solicitud
from app.database import get_db
from app.models import Solicitud, SolicitudHistorial
from app.schemas.solicitud import SeguimientoOut, SolicitudPublicCreate

router = APIRouter()


async def _crear_solicitud_publica(
    db: AsyncSession, body: SolicitudPublicCreate, tipo_tramite_forzado: str
) -> Solicitud:
    if body.tipo_tramite != tipo_tramite_forzado:
        raise HTTPException(status_code=400, detail=f"tipo_tramite debe ser '{tipo_tramite_forzado}'")
    today = date.today()
    num = await next_num_solicitud(db, body.tipo_tramite)
    sol = Solicitud(
        num_solicitud=num,
        fecha_ingreso=today,
        fecha_ultima_actualizacion=today,
        estado_actual=0,
        **body.model_dump(),
    )
    db.add(sol)
    await db.flush()
    db.add(
        SolicitudHistorial(
            solicitud_id=sol.id,
            estado_anterior=None,
            estado_nuevo=0,
            motivo="Ingreso desde formulario publico",
            usuario_id=None,
        )
    )
    await db.commit()
    await db.refresh(sol)
    return sol


@router.post("/solicitudes/factibilidad", status_code=status.HTTP_201_CREATED)
async def crear_factibilidad(
    body: SolicitudPublicCreate, db: AsyncSession = Depends(get_db)
) -> dict:
    sol = await _crear_solicitud_publica(db, body, TipoTramite.FACTIBILIDAD)
    return {"num_solicitud": sol.num_solicitud, "id": str(sol.id)}


@router.post("/solicitudes/conexion", status_code=status.HTTP_201_CREATED)
async def crear_conexion(
    body: SolicitudPublicCreate, db: AsyncSession = Depends(get_db)
) -> dict:
    sol = await _crear_solicitud_publica(db, body, TipoTramite.CONEXION)
    return {"num_solicitud": sol.num_solicitud, "id": str(sol.id)}


@router.get("/seguimiento/{num_solicitud}", response_model=SeguimientoOut)
async def seguimiento(num_solicitud: str, db: AsyncSession = Depends(get_db)) -> SeguimientoOut:
    result = await db.execute(select(Solicitud).where(Solicitud.num_solicitud == num_solicitud))
    sol = result.scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return SeguimientoOut(
        num_solicitud=sol.num_solicitud,
        tipo_tramite=sol.tipo_tramite,
        tipo_solicitud=sol.tipo_solicitud,
        estado_actual=sol.estado_actual,
        fecha_ingreso=sol.fecha_ingreso,
        fecha_ultima_actualizacion=sol.fecha_ultima_actualizacion,
        fecha_respuesta_empresa=sol.fecha_respuesta_empresa,
        requirente_nombre=sol.requirente_nombre,
        direccion_instalacion=sol.direccion_instalacion,
        observaciones=sol.observaciones,
    )

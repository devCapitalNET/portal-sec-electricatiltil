"""Endpoints publicos (sin auth) para el formulario de Requirente."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.email import send_email
from app.core.email_templates import cliente_completo_info, recibo_solicitud
from app.core.enums import EstadoActual, TipoTramite
from app.core.num_solicitud import next_num_solicitud
from app.database import get_db
from app.models import Solicitud, SolicitudHistorial
from app.schemas.solicitud import SeguimientoOut, SeguimientoUpdateIn, SolicitudPublicCreate

router = APIRouter()


def _normalize_rut(rut: str) -> str:
    return rut.replace(".", "").replace("-", "").strip().lower()


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

    # Notificacion de recibo al requirente
    subject, html, text = recibo_solicitud(
        sol.num_solicitud, sol.requirente_nombre, settings.PORTAL_PUBLIC_URL
    )
    if sol.requirente_email:
        await send_email(
            db,
            to=sol.requirente_email,
            subject=subject,
            html=html,
            text=text,
            template="recibo_solicitud",
            solicitud_id=sol.id,
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

    motivo_pendiente = None
    if sol.estado_actual == EstadoActual.PENDIENTE_INFORMACION_CLIENTE:
        ultimo = (
            await db.execute(
                select(SolicitudHistorial)
                .where(
                    SolicitudHistorial.solicitud_id == sol.id,
                    SolicitudHistorial.estado_nuevo == EstadoActual.PENDIENTE_INFORMACION_CLIENTE,
                )
                .order_by(SolicitudHistorial.created_at.desc())
                .limit(1)
            )
        ).scalar_one_or_none()
        if ultimo:
            motivo_pendiente = ultimo.motivo

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
        causa_rechazo_notificacion=sol.causa_rechazo_notificacion,
        estudios_tecnicos_requeridos=sol.estudios_tecnicos_requeridos,
        respuesta_factibilidad=sol.respuesta_factibilidad,
        motivo_pendiente=motivo_pendiente,
    )


@router.patch("/seguimiento/{num_solicitud}", response_model=SeguimientoOut)
async def actualizar_seguimiento(
    num_solicitud: str,
    body: SeguimientoUpdateIn,
    db: AsyncSession = Depends(get_db),
) -> SeguimientoOut:
    """El cliente completa informacion y/o pasa a En analisis si estaba pendiente."""
    sol = (
        await db.execute(select(Solicitud).where(Solicitud.num_solicitud == num_solicitud))
    ).scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    if _normalize_rut(body.requirente_rut) != _normalize_rut(sol.requirente_rut):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="RUT no coincide con el requirente")

    data = body.model_dump(exclude_unset=True, exclude={"requirente_rut", "mensaje"})
    for key, value in data.items():
        setattr(sol, key, value)

    estado_anterior = sol.estado_actual
    if sol.estado_actual == EstadoActual.PENDIENTE_INFORMACION_CLIENTE:
        sol.estado_actual = EstadoActual.EN_ANALISIS_ADMISIBILIDAD
        db.add(
            SolicitudHistorial(
                solicitud_id=sol.id,
                estado_anterior=estado_anterior,
                estado_nuevo=EstadoActual.EN_ANALISIS_ADMISIBILIDAD,
                motivo=body.mensaje or "Cliente completo informacion solicitada",
                usuario_id=None,
            )
        )

    sol.fecha_ultima_actualizacion = date.today()

    # Notificar al admin que el cliente actualizo informacion
    subject, html, text = cliente_completo_info(sol.num_solicitud, sol.requirente_nombre)
    await send_email(
        db,
        to=settings.ADMIN_NOTIFY_EMAIL,
        subject=subject,
        html=html,
        text=text,
        template="cliente_completo_info",
        solicitud_id=sol.id,
    )

    await db.commit()
    return await seguimiento(sol.num_solicitud, db)

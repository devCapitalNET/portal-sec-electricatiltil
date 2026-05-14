"""CRUD admin sobre solicitudes (autenticado JWT)."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.auth_jwt import get_current_user
from app.core.enums import EstadoActual
from app.core.num_solicitud import next_num_solicitud
from app.database import get_db
from app.models import Solicitud, SolicitudHistorial, User
from app.schemas.solicitud import (
    SolicitudAdminCreate,
    SolicitudDetailOut,
    SolicitudListItem,
    SolicitudListResponse,
    SolicitudUpdate,
    TransicionEstadoIn,
)

router = APIRouter()


@router.get("/solicitudes", response_model=SolicitudListResponse)
async def list_solicitudes(
    tipo_tramite: str | None = None,
    estado_actual: int | None = None,
    rut: str | None = None,
    num_solicitud: str | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> SolicitudListResponse:
    filters = []
    if tipo_tramite:
        filters.append(Solicitud.tipo_tramite == tipo_tramite)
    if estado_actual is not None:
        filters.append(Solicitud.estado_actual == estado_actual)
    if rut:
        filters.append(or_(Solicitud.requirente_rut == rut, Solicitud.propietario_rut == rut))
    if num_solicitud:
        filters.append(Solicitud.num_solicitud.ilike(f"%{num_solicitud}%"))
    if fecha_desde:
        filters.append(Solicitud.fecha_ingreso >= fecha_desde)
    if fecha_hasta:
        filters.append(Solicitud.fecha_ingreso <= fecha_hasta)

    where = and_(*filters) if filters else None

    total_q = select(func.count(Solicitud.id))
    if where is not None:
        total_q = total_q.where(where)
    total = (await db.execute(total_q)).scalar_one()

    q = select(Solicitud).order_by(Solicitud.fecha_ingreso.desc()).offset((page - 1) * page_size).limit(page_size)
    if where is not None:
        q = q.where(where)
    rows = (await db.execute(q)).scalars().all()

    return SolicitudListResponse(
        items=[SolicitudListItem.model_validate(s) for s in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/solicitudes/{solicitud_id}", response_model=SolicitudDetailOut)
async def get_solicitud(
    solicitud_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> SolicitudDetailOut:
    result = await db.execute(
        select(Solicitud).where(Solicitud.id == solicitud_id).options(selectinload(Solicitud.historial))
    )
    sol = result.scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return SolicitudDetailOut.model_validate(sol)


@router.post("/solicitudes", response_model=SolicitudDetailOut, status_code=status.HTTP_201_CREATED)
async def create_solicitud_admin(
    body: SolicitudAdminCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SolicitudDetailOut:
    today = date.today()
    num = await next_num_solicitud(db, body.tipo_tramite)
    sol = Solicitud(
        num_solicitud=num,
        fecha_ingreso=body.fecha_ingreso or today,
        fecha_ultima_actualizacion=today,
        **body.model_dump(exclude={"fecha_ingreso"}),
    )
    db.add(sol)
    await db.flush()
    db.add(
        SolicitudHistorial(
            solicitud_id=sol.id,
            estado_anterior=None,
            estado_nuevo=sol.estado_actual,
            motivo="Creacion por admin",
            usuario_id=user.id,
        )
    )
    await db.commit()
    result = await db.execute(
        select(Solicitud).where(Solicitud.id == sol.id).options(selectinload(Solicitud.historial))
    )
    return SolicitudDetailOut.model_validate(result.scalar_one())


@router.patch("/solicitudes/{solicitud_id}", response_model=SolicitudDetailOut)
async def update_solicitud(
    solicitud_id: UUID,
    body: SolicitudUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SolicitudDetailOut:
    result = await db.execute(select(Solicitud).where(Solicitud.id == solicitud_id))
    sol = result.scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")

    data = body.model_dump(exclude_unset=True)
    estado_nuevo = data.pop("estado_actual", None)
    estado_anterior = sol.estado_actual

    for key, value in data.items():
        setattr(sol, key, value)

    if estado_nuevo is not None and estado_nuevo != estado_anterior:
        sol.estado_actual = estado_nuevo
        db.add(
            SolicitudHistorial(
                solicitud_id=sol.id,
                estado_anterior=estado_anterior,
                estado_nuevo=estado_nuevo,
                motivo="Actualizacion PATCH",
                usuario_id=user.id,
            )
        )

    sol.fecha_ultima_actualizacion = date.today()
    await db.commit()
    result = await db.execute(
        select(Solicitud).where(Solicitud.id == sol.id).options(selectinload(Solicitud.historial))
    )
    return SolicitudDetailOut.model_validate(result.scalar_one())


@router.post("/solicitudes/{solicitud_id}/transicion", response_model=SolicitudDetailOut)
async def transicion_estado(
    solicitud_id: UUID,
    body: TransicionEstadoIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SolicitudDetailOut:
    result = await db.execute(select(Solicitud).where(Solicitud.id == solicitud_id))
    sol = result.scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    if body.nuevo_estado == sol.estado_actual:
        raise HTTPException(status_code=400, detail="El estado actual ya es el solicitado")

    estado_anterior = sol.estado_actual
    sol.estado_actual = body.nuevo_estado
    sol.fecha_ultima_actualizacion = date.today()

    if body.nuevo_estado in {EstadoActual.ADMISIBLE, EstadoActual.INADMISIBLE, EstadoActual.CERRADA}:
        if sol.fecha_respuesta_empresa is None:
            sol.fecha_respuesta_empresa = date.today()
    if body.nuevo_estado == EstadoActual.INADMISIBLE and not sol.causa_rechazo_notificacion and body.motivo:
        sol.causa_rechazo_notificacion = body.motivo[:300]

    db.add(
        SolicitudHistorial(
            solicitud_id=sol.id,
            estado_anterior=estado_anterior,
            estado_nuevo=body.nuevo_estado,
            motivo=body.motivo,
            usuario_id=user.id,
        )
    )

    await db.commit()
    result = await db.execute(
        select(Solicitud).where(Solicitud.id == sol.id).options(selectinload(Solicitud.historial))
    )
    return SolicitudDetailOut.model_validate(result.scalar_one())


@router.get("/dashboard")
async def dashboard(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    counts = (
        await db.execute(
            select(Solicitud.estado_actual, func.count(Solicitud.id)).group_by(Solicitud.estado_actual)
        )
    ).all()
    por_estado = {int(estado): int(cnt) for estado, cnt in counts}

    por_tipo = (
        await db.execute(
            select(Solicitud.tipo_tramite, func.count(Solicitud.id)).group_by(Solicitud.tipo_tramite)
        )
    ).all()
    tipos = {tipo: int(cnt) for tipo, cnt in por_tipo}

    return {
        "por_estado": por_estado,
        "por_tipo": tipos,
        "total": sum(por_estado.values()),
    }

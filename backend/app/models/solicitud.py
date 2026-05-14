"""Solicitud unificada (factibilidad + conexion/ampliacion) conforme Anexo Tecnico N1 SEC."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Solicitud(Base):
    __tablename__ = "solicitudes"

    # Identidad
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    num_solicitud: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    tipo_tramite: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    tipo_solicitud: Mapped[int] = mapped_column(Integer, nullable=False)

    # Fechas
    fecha_ingreso: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    fecha_ultima_actualizacion: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_respuesta_empresa: Mapped[date | None] = mapped_column(Date, index=True, nullable=True)
    fecha_visita_terreno: Mapped[date | None] = mapped_column(Date, nullable=True)
    hora_visita_terreno: Mapped[time | None] = mapped_column(Time, nullable=True)
    fecha_ingreso_notificacion: Mapped[date | None] = mapped_column(Date, nullable=True)
    fecha_rechazo_notificacion: Mapped[date | None] = mapped_column(Date, nullable=True)
    fecha_conexion: Mapped[date | None] = mapped_column(Date, nullable=True)
    fecha_entrega_cliente_id: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Estado
    estado_actual: Mapped[int] = mapped_column(Integer, index=True, nullable=False, default=0)

    # Requirente
    requirente_rut: Mapped[str] = mapped_column(String(15), index=True, nullable=False)
    requirente_nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    requirente_direccion: Mapped[str] = mapped_column(String(200), nullable=False)
    requirente_telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    requirente_email: Mapped[str] = mapped_column(String(100), nullable=False)

    # Propietario
    propietario_rut: Mapped[str] = mapped_column(String(15), index=True, nullable=False)
    propietario_nombre: Mapped[str] = mapped_column(String(200), nullable=False)
    propietario_direccion: Mapped[str | None] = mapped_column(String(200), nullable=True)
    propietario_telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    propietario_email: Mapped[str] = mapped_column(String(100), nullable=False)
    autorizacion_tercero: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # Tecnico
    tipo_consumo_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    definitivo_provisorio: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tipo_tension: Mapped[int] = mapped_column(Integer, nullable=False)
    potencia_solicitada: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    tipo_fase: Mapped[int] = mapped_column(Integer, nullable=False)
    concesion_id: Mapped[str] = mapped_column(String(10), nullable=False)
    tipo_instalacion_id: Mapped[int] = mapped_column(Integer, nullable=False)
    identificador_conexion: Mapped[str] = mapped_column(String(50), nullable=False)
    respuesta_factibilidad: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    estudios_tecnicos_requeridos: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ubicacion_empalme: Mapped[int] = mapped_column(Integer, nullable=False)

    # Ubicacion
    direccion_instalacion: Mapped[str] = mapped_column(String(200), nullable=False)
    datum_id: Mapped[int] = mapped_column(Integer, nullable=False)
    tipo_zona_utm: Mapped[int] = mapped_column(Integer, nullable=False)
    coord_x: Mapped[str] = mapped_column(String(19), nullable=False)
    coord_y: Mapped[str] = mapped_column(String(19), nullable=False)

    # Cliente/medidor (solo conexion o ampliacion)
    cliente_id: Mapped[str | None] = mapped_column(String(30), nullable=True)
    medidor_id: Mapped[str | None] = mapped_column(String(10), nullable=True)
    numero_medidor: Mapped[str | None] = mapped_column(String(15), nullable=True)
    marca_medidor: Mapped[str | None] = mapped_column(String(50), nullable=True)
    modelo_medidor: Mapped[str | None] = mapped_column(String(50), nullable=True)
    punto_consumo_id: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Presupuesto (solo conexion, segun estado)
    presupuesto: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    detalle_presupuesto: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    modalidad_financiamiento: Mapped[str | None] = mapped_column(String(200), nullable=True)
    codigos_vnr: Mapped[str | None] = mapped_column(String(200), nullable=True)
    requiere_permisos_terceros: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # Otros
    causa_rechazo_notificacion: Mapped[str | None] = mapped_column(String(300), nullable=True)
    observaciones_visita: Mapped[str | None] = mapped_column(String(500), nullable=True)
    observaciones: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    historial: Mapped[list[SolicitudHistorial]] = relationship(
        back_populates="solicitud", cascade="all, delete-orphan", order_by="SolicitudHistorial.created_at.desc()"
    )


class SolicitudHistorial(Base):
    __tablename__ = "solicitud_historial"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    solicitud_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitudes.id", ondelete="CASCADE"), nullable=False
    )
    estado_anterior: Mapped[int | None] = mapped_column(Integer, nullable=True)
    estado_nuevo: Mapped[int] = mapped_column(Integer, nullable=False)
    motivo: Mapped[str | None] = mapped_column(Text, nullable=True)
    usuario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    solicitud: Mapped[Solicitud] = relationship(back_populates="historial")

"""Schemas internos (admin + publico) en snake_case."""

from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class SolicitudBase(BaseModel):
    tipo_tramite: str = Field(..., pattern="^(factibilidad|conexion)$")
    tipo_solicitud: int = Field(..., ge=1, le=2)

    requirente_rut: str = Field(..., max_length=15)
    requirente_nombre: str = Field(..., max_length=200)
    requirente_direccion: str = Field(..., max_length=200)
    requirente_telefono: str | None = Field(None, max_length=20)
    requirente_email: EmailStr

    propietario_rut: str = Field(..., max_length=15)
    propietario_nombre: str = Field(..., max_length=200)
    propietario_direccion: str | None = Field(None, max_length=200)
    propietario_telefono: str | None = Field(None, max_length=20)
    propietario_email: EmailStr
    autorizacion_tercero: bool | None = None

    tipo_consumo_id: int | None = None
    definitivo_provisorio: int | None = None
    tipo_tension: int = Field(..., ge=1, le=2)
    potencia_solicitada: Decimal
    tipo_fase: int = Field(..., ge=1, le=3)
    concesion_id: str = Field(..., max_length=10)
    tipo_instalacion_id: int
    identificador_conexion: str = Field(..., max_length=50)
    ubicacion_empalme: int

    direccion_instalacion: str = Field(..., max_length=200)
    datum_id: int
    tipo_zona_utm: int
    coord_x: str = Field(..., max_length=19)
    coord_y: str = Field(..., max_length=19)

    cliente_id: str | None = Field(None, max_length=30)
    medidor_id: str | None = Field(None, max_length=10)
    numero_medidor: str | None = Field(None, max_length=15)
    punto_consumo_id: str | None = Field(None, max_length=30)

    observaciones: str | None = Field(None, max_length=500)


class SolicitudPublicCreate(SolicitudBase):
    """Solicitud creada por requirente desde formulario publico. Estado inicial = INGRESADA."""


class SolicitudAdminCreate(SolicitudBase):
    """Solicitud creada por personal interno. Puede setear estado y fechas adicionales."""

    estado_actual: int = Field(0, ge=0, le=6)
    fecha_ingreso: date | None = None
    respuesta_factibilidad: bool | None = None
    estudios_tecnicos_requeridos: str | None = Field(None, max_length=500)
    fecha_respuesta_empresa: date | None = None


class SolicitudUpdate(BaseModel):
    """Actualizacion parcial via PATCH desde admin."""

    estado_actual: int | None = Field(None, ge=0, le=6)
    fecha_respuesta_empresa: date | None = None
    fecha_visita_terreno: date | None = None
    hora_visita_terreno: time | None = None
    observaciones_visita: str | None = Field(None, max_length=500)
    fecha_ingreso_notificacion: date | None = None
    fecha_rechazo_notificacion: date | None = None
    causa_rechazo_notificacion: str | None = Field(None, max_length=300)
    fecha_conexion: date | None = None
    fecha_entrega_cliente_id: date | None = None
    respuesta_factibilidad: bool | None = None
    estudios_tecnicos_requeridos: str | None = Field(None, max_length=500)
    presupuesto: Decimal | None = None
    detalle_presupuesto: str | None = Field(None, max_length=1000)
    modalidad_financiamiento: str | None = Field(None, max_length=200)
    codigos_vnr: str | None = Field(None, max_length=200)
    requiere_permisos_terceros: bool | None = None
    cliente_id: str | None = Field(None, max_length=30)
    medidor_id: str | None = Field(None, max_length=10)
    numero_medidor: str | None = Field(None, max_length=15)
    marca_medidor: str | None = Field(None, max_length=50)
    modelo_medidor: str | None = Field(None, max_length=50)
    observaciones: str | None = Field(None, max_length=500)


class TransicionEstadoIn(BaseModel):
    nuevo_estado: int = Field(..., ge=0, le=6)
    motivo: str | None = Field(None, max_length=1000)


class HistorialOut(BaseModel):
    id: UUID
    estado_anterior: int | None
    estado_nuevo: int
    motivo: str | None
    usuario_id: UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudOut(SolicitudBase):
    id: UUID
    num_solicitud: str
    estado_actual: int
    fecha_ingreso: date
    fecha_ultima_actualizacion: date
    fecha_respuesta_empresa: date | None = None
    fecha_visita_terreno: date | None = None
    hora_visita_terreno: time | None = None
    observaciones_visita: str | None = None
    fecha_ingreso_notificacion: date | None = None
    fecha_rechazo_notificacion: date | None = None
    causa_rechazo_notificacion: str | None = None
    fecha_conexion: date | None = None
    fecha_entrega_cliente_id: date | None = None
    respuesta_factibilidad: bool | None = None
    estudios_tecnicos_requeridos: str | None = None
    presupuesto: Decimal | None = None
    detalle_presupuesto: str | None = None
    modalidad_financiamiento: str | None = None
    codigos_vnr: str | None = None
    requiere_permisos_terceros: bool | None = None
    marca_medidor: str | None = None
    modelo_medidor: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SolicitudDetailOut(SolicitudOut):
    historial: list[HistorialOut] = []


class SolicitudListItem(BaseModel):
    id: UUID
    num_solicitud: str
    tipo_tramite: str
    tipo_solicitud: int
    estado_actual: int
    fecha_ingreso: date
    fecha_ultima_actualizacion: date
    fecha_respuesta_empresa: date | None
    requirente_rut: str
    requirente_nombre: str
    direccion_instalacion: str
    potencia_solicitada: Decimal

    model_config = {"from_attributes": True}


class SolicitudListResponse(BaseModel):
    items: list[SolicitudListItem]
    total: int
    page: int
    page_size: int


class SeguimientoOut(BaseModel):
    num_solicitud: str
    tipo_tramite: str
    tipo_solicitud: int
    estado_actual: int
    fecha_ingreso: date
    fecha_ultima_actualizacion: date
    fecha_respuesta_empresa: date | None
    requirente_nombre: str
    direccion_instalacion: str
    observaciones: str | None

"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-13 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("nombre", sa.String(length=150), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("rol", sa.String(length=20), nullable=False),
        sa.Column("activo", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "sec_credentials",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("nombre_consumidor", sa.String(length=200), nullable=False),
        sa.Column("activa", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_sec_credentials_username", "sec_credentials", ["username"])

    op.create_table(
        "sec_request_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("endpoint", sa.String(length=100), nullable=False),
        sa.Column("method", sa.String(length=10), nullable=False),
        sa.Column("request_body", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("response_status", sa.Integer(), nullable=False),
        sa.Column("response_body", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("ip_origen", sa.String(length=50), nullable=True),
        sa.Column("username", sa.String(length=100), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sec_request_log_endpoint", "sec_request_log", ["endpoint"])
    op.create_index("ix_sec_request_log_created_at", "sec_request_log", ["created_at"])

    op.create_table(
        "solicitudes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("num_solicitud", sa.String(length=30), nullable=False),
        sa.Column("tipo_tramite", sa.String(length=20), nullable=False),
        sa.Column("tipo_solicitud", sa.Integer(), nullable=False),
        sa.Column("fecha_ingreso", sa.Date(), nullable=False),
        sa.Column("fecha_ultima_actualizacion", sa.Date(), nullable=False),
        sa.Column("fecha_respuesta_empresa", sa.Date(), nullable=True),
        sa.Column("fecha_visita_terreno", sa.Date(), nullable=True),
        sa.Column("hora_visita_terreno", sa.Time(), nullable=True),
        sa.Column("fecha_ingreso_notificacion", sa.Date(), nullable=True),
        sa.Column("fecha_rechazo_notificacion", sa.Date(), nullable=True),
        sa.Column("fecha_conexion", sa.Date(), nullable=True),
        sa.Column("fecha_entrega_cliente_id", sa.Date(), nullable=True),
        sa.Column("estado_actual", sa.Integer(), nullable=False),
        sa.Column("requirente_rut", sa.String(length=15), nullable=False),
        sa.Column("requirente_nombre", sa.String(length=200), nullable=False),
        sa.Column("requirente_direccion", sa.String(length=200), nullable=False),
        sa.Column("requirente_telefono", sa.String(length=20), nullable=True),
        sa.Column("requirente_email", sa.String(length=100), nullable=False),
        sa.Column("propietario_rut", sa.String(length=15), nullable=False),
        sa.Column("propietario_nombre", sa.String(length=200), nullable=False),
        sa.Column("propietario_direccion", sa.String(length=200), nullable=True),
        sa.Column("propietario_telefono", sa.String(length=20), nullable=True),
        sa.Column("propietario_email", sa.String(length=100), nullable=False),
        sa.Column("autorizacion_tercero", sa.Boolean(), nullable=True),
        sa.Column("tipo_consumo_id", sa.Integer(), nullable=True),
        sa.Column("definitivo_provisorio", sa.Integer(), nullable=True),
        sa.Column("tipo_tension", sa.Integer(), nullable=False),
        sa.Column("potencia_solicitada", sa.Numeric(8, 2), nullable=False),
        sa.Column("tipo_fase", sa.Integer(), nullable=False),
        sa.Column("concesion_id", sa.String(length=10), nullable=False),
        sa.Column("tipo_instalacion_id", sa.Integer(), nullable=False),
        sa.Column("identificador_conexion", sa.String(length=50), nullable=False),
        sa.Column("respuesta_factibilidad", sa.Boolean(), nullable=True),
        sa.Column("estudios_tecnicos_requeridos", sa.String(length=500), nullable=True),
        sa.Column("ubicacion_empalme", sa.Integer(), nullable=False),
        sa.Column("direccion_instalacion", sa.String(length=200), nullable=False),
        sa.Column("datum_id", sa.Integer(), nullable=False),
        sa.Column("tipo_zona_utm", sa.Integer(), nullable=False),
        sa.Column("coord_x", sa.String(length=19), nullable=False),
        sa.Column("coord_y", sa.String(length=19), nullable=False),
        sa.Column("cliente_id", sa.String(length=30), nullable=True),
        sa.Column("medidor_id", sa.String(length=10), nullable=True),
        sa.Column("numero_medidor", sa.String(length=15), nullable=True),
        sa.Column("marca_medidor", sa.String(length=50), nullable=True),
        sa.Column("modelo_medidor", sa.String(length=50), nullable=True),
        sa.Column("punto_consumo_id", sa.String(length=30), nullable=True),
        sa.Column("presupuesto", sa.Numeric(12, 2), nullable=True),
        sa.Column("detalle_presupuesto", sa.String(length=1000), nullable=True),
        sa.Column("modalidad_financiamiento", sa.String(length=200), nullable=True),
        sa.Column("codigos_vnr", sa.String(length=200), nullable=True),
        sa.Column("requiere_permisos_terceros", sa.Boolean(), nullable=True),
        sa.Column("causa_rechazo_notificacion", sa.String(length=300), nullable=True),
        sa.Column("observaciones_visita", sa.String(length=500), nullable=True),
        sa.Column("observaciones", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("num_solicitud"),
    )
    op.create_index("ix_solicitudes_num_solicitud", "solicitudes", ["num_solicitud"])
    op.create_index("ix_solicitudes_tipo_tramite", "solicitudes", ["tipo_tramite"])
    op.create_index("ix_solicitudes_fecha_ingreso", "solicitudes", ["fecha_ingreso"])
    op.create_index("ix_solicitudes_fecha_respuesta_empresa", "solicitudes", ["fecha_respuesta_empresa"])
    op.create_index("ix_solicitudes_estado_actual", "solicitudes", ["estado_actual"])
    op.create_index("ix_solicitudes_requirente_rut", "solicitudes", ["requirente_rut"])
    op.create_index("ix_solicitudes_propietario_rut", "solicitudes", ["propietario_rut"])

    op.create_table(
        "solicitud_historial",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("solicitud_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("estado_anterior", sa.Integer(), nullable=True),
        sa.Column("estado_nuevo", sa.Integer(), nullable=False),
        sa.Column("motivo", sa.Text(), nullable=True),
        sa.Column("usuario_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["solicitud_id"], ["solicitudes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["usuario_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("solicitud_historial")
    op.drop_table("solicitudes")
    op.drop_table("sec_request_log")
    op.drop_table("sec_credentials")
    op.drop_table("users")

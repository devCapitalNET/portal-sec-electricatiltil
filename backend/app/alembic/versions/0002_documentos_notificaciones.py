"""documentos y notificaciones

Revision ID: 0002_documentos_notificaciones
Revises: 0001_initial
Create Date: 2026-05-17 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_documentos_notificaciones"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "documentos",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("solicitud_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tipo", sa.String(length=40), nullable=False),
        sa.Column("nombre_original", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("subido_por", sa.String(length=20), nullable=False),
        sa.Column("uploaded_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["solicitud_id"], ["solicitudes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["uploaded_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_documentos_solicitud_id", "documentos", ["solicitud_id"])

    op.create_table(
        "notificaciones",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("solicitud_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("canal", sa.String(length=20), nullable=False),
        sa.Column("destinatario", sa.String(length=200), nullable=False),
        sa.Column("asunto", sa.String(length=300), nullable=False),
        sa.Column("cuerpo", sa.Text(), nullable=False),
        sa.Column("template", sa.String(length=50), nullable=True),
        sa.Column("estado", sa.String(length=20), nullable=False),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["solicitud_id"], ["solicitudes.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notificaciones_solicitud_id", "notificaciones", ["solicitud_id"])
    op.create_index("ix_notificaciones_created_at", "notificaciones", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_notificaciones_created_at", table_name="notificaciones")
    op.drop_index("ix_notificaciones_solicitud_id", table_name="notificaciones")
    op.drop_table("notificaciones")
    op.drop_index("ix_documentos_solicitud_id", table_name="documentos")
    op.drop_table("documentos")

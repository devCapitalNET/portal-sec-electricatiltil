"""Schemas Pydantic para Documento."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocumentoOut(BaseModel):
    id: UUID
    solicitud_id: UUID
    tipo: str
    nombre_original: str
    content_type: str
    size_bytes: int
    subido_por: str
    uploaded_by_user_id: UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}

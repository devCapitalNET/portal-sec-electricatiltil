"""Router de gestion de documentos adjuntos (admin + publico)."""

from __future__ import annotations

import mimetypes
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_jwt import get_current_user
from app.core.enums import TIPO_DOCUMENTO_PUBLICO, SubidoPor, TipoDocumento
from app.core.storage import delete_file, open_file, save_upload, uploads_root
from app.database import get_db
from app.models import Documento, Solicitud, User
from app.schemas.documento import DocumentoOut

router = APIRouter()


def _validate_tipo(tipo: str) -> TipoDocumento:
    try:
        return TipoDocumento(tipo)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Tipo de documento invalido: {tipo}")


async def _get_solicitud_by_id(db: AsyncSession, solicitud_id: UUID) -> Solicitud:
    sol = (
        await db.execute(select(Solicitud).where(Solicitud.id == solicitud_id))
    ).scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return sol


async def _get_solicitud_by_num(db: AsyncSession, num: str) -> Solicitud:
    sol = (
        await db.execute(select(Solicitud).where(Solicitud.num_solicitud == num))
    ).scalar_one_or_none()
    if sol is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return sol


@router.post(
    "/admin/solicitudes/{solicitud_id}/documentos",
    response_model=DocumentoOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_admin(
    solicitud_id: UUID,
    tipo: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DocumentoOut:
    sol = await _get_solicitud_by_id(db, solicitud_id)
    tipo_doc = _validate_tipo(tipo)
    rel_path, size = await save_upload(file, sol.id)
    doc = Documento(
        solicitud_id=sol.id,
        tipo=tipo_doc.value,
        nombre_original=file.filename or "archivo",
        content_type=file.content_type or "application/octet-stream",
        size_bytes=size,
        storage_path=rel_path,
        subido_por=SubidoPor.ADMIN.value,
        uploaded_by_user_id=user.id,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentoOut.model_validate(doc)


@router.get(
    "/admin/solicitudes/{solicitud_id}/documentos",
    response_model=list[DocumentoOut],
)
async def list_admin(
    solicitud_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[DocumentoOut]:
    sol = await _get_solicitud_by_id(db, solicitud_id)
    rows = (
        await db.execute(
            select(Documento)
            .where(Documento.solicitud_id == sol.id)
            .order_by(Documento.created_at.desc())
        )
    ).scalars().all()
    return [DocumentoOut.model_validate(r) for r in rows]


@router.delete("/admin/documentos/{doc_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_admin(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc = (
        await db.execute(select(Documento).where(Documento.id == doc_id))
    ).scalar_one_or_none()
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    delete_file(doc.storage_path)
    await db.delete(doc)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/admin/documentos/{doc_id}/download")
async def download_admin(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> FileResponse:
    doc = (
        await db.execute(select(Documento).where(Documento.id == doc_id))
    ).scalar_one_or_none()
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    target = uploads_root() / doc.storage_path
    if not target.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado en disco")
    media_type = doc.content_type or mimetypes.guess_type(doc.nombre_original)[0] or "application/octet-stream"
    return FileResponse(path=str(target), filename=doc.nombre_original, media_type=media_type)


@router.post(
    "/public/solicitudes/{num_solicitud}/documentos",
    response_model=DocumentoOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_publico(
    num_solicitud: str,
    rut: str = Form(...),
    tipo: str = Form(TipoDocumento.ANTECEDENTE_CLIENTE.value),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> DocumentoOut:
    sol = await _get_solicitud_by_num(db, num_solicitud)
    if rut.strip().replace(".", "").replace("-", "").lower() != sol.requirente_rut.replace(".", "").replace("-", "").lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="RUT no coincide con el requirente")
    tipo_doc = _validate_tipo(tipo)
    if tipo_doc not in {TipoDocumento.ANTECEDENTE_CLIENTE, TipoDocumento.PLANO, TipoDocumento.OTRO}:
        raise HTTPException(status_code=400, detail="Tipo de documento no permitido para subida publica")
    rel_path, size = await save_upload(file, sol.id)
    doc = Documento(
        solicitud_id=sol.id,
        tipo=tipo_doc.value,
        nombre_original=file.filename or "archivo",
        content_type=file.content_type or "application/octet-stream",
        size_bytes=size,
        storage_path=rel_path,
        subido_por=SubidoPor.CLIENTE.value,
        uploaded_by_user_id=None,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentoOut.model_validate(doc)


@router.get(
    "/public/seguimiento/{num_solicitud}/documentos",
    response_model=list[DocumentoOut],
)
async def list_publico(
    num_solicitud: str,
    db: AsyncSession = Depends(get_db),
) -> list[DocumentoOut]:
    sol = await _get_solicitud_by_num(db, num_solicitud)
    rows = (
        await db.execute(
            select(Documento)
            .where(Documento.solicitud_id == sol.id)
            .order_by(Documento.created_at.desc())
        )
    ).scalars().all()
    visibles = [
        r
        for r in rows
        if r.subido_por == SubidoPor.ADMIN.value
        and r.tipo in {t.value for t in TIPO_DOCUMENTO_PUBLICO}
    ]
    return [DocumentoOut.model_validate(r) for r in visibles]


@router.get("/public/documentos/{doc_id}/download")
async def download_publico(
    doc_id: UUID,
    num_solicitud: str,
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    """Descarga publica: requiere ?num_solicitud=... y solo permite docs visibles publicamente."""
    doc = (
        await db.execute(select(Documento).where(Documento.id == doc_id))
    ).scalar_one_or_none()
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    sol = (
        await db.execute(select(Solicitud).where(Solicitud.id == doc.solicitud_id))
    ).scalar_one_or_none()
    if sol is None or sol.num_solicitud != num_solicitud:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
    if doc.subido_por != SubidoPor.ADMIN.value or doc.tipo not in {t.value for t in TIPO_DOCUMENTO_PUBLICO}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Documento no publico")
    target = uploads_root() / doc.storage_path
    if not target.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado en disco")
    media_type = doc.content_type or mimetypes.guess_type(doc.nombre_original)[0] or "application/octet-stream"
    return FileResponse(path=str(target), filename=doc.nombre_original, media_type=media_type)

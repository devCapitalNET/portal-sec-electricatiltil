"""Storage local de archivos adjuntos."""

from __future__ import annotations

import asyncio
import os
import re
import uuid
from pathlib import Path
from typing import BinaryIO

from fastapi import HTTPException, UploadFile, status

from app.config import settings

_SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]+")


def _sanitize_name(name: str) -> str:
    name = os.path.basename(name)
    name = _SAFE_NAME_RE.sub("_", name).strip("._-") or "archivo"
    return name[:200]


def uploads_root() -> Path:
    root = Path(settings.UPLOADS_DIR)
    root.mkdir(parents=True, exist_ok=True)
    return root


def validate_upload(file: UploadFile, size_bytes: int) -> None:
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Archivo excede el tamano maximo ({settings.MAX_UPLOAD_MB} MB)",
        )
    if file.content_type not in settings.ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Tipo MIME no permitido: {file.content_type}",
        )


def _write_sync(target: Path, data: bytes) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wb") as f:
        f.write(data)


async def save_upload(file: UploadFile, solicitud_id: uuid.UUID) -> tuple[str, int]:
    data = await file.read()
    size = len(data)
    validate_upload(file, size)
    name = _sanitize_name(file.filename or "archivo")
    rel_path = f"{solicitud_id}/{uuid.uuid4().hex}_{name}"
    target = uploads_root() / rel_path
    await asyncio.to_thread(_write_sync, target, data)
    return rel_path, size


def open_file(rel_path: str) -> tuple[Path, BinaryIO]:
    target = uploads_root() / rel_path
    if not target.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado")
    return target, target.open("rb")


def delete_file(rel_path: str) -> None:
    target = uploads_root() / rel_path
    try:
        target.unlink(missing_ok=True)
    except OSError:
        pass

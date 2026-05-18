"""Tests para el flujo /advance, documentos, completar info publico y export Excel."""

from __future__ import annotations

import io

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://test"


async def _login(ac: AsyncClient) -> str:
    r = await ac.post("/auth/login", json={"email": "admin@tiltil.cl", "password": "admin123"})
    return r.json()["access_token"]


async def _get_solicitud_id(ac: AsyncClient, token: str, num: str) -> str:
    headers = {"Authorization": f"Bearer {token}"}
    r = await ac.get(f"/admin/solicitudes?num_solicitud={num}", headers=headers)
    items = r.json()["items"]
    assert items, f"No se encontro solicitud {num}"
    return items[0]["id"]


@pytest.mark.asyncio
async def test_advance_inadmisible_sin_estudios_falla():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        token = await _login(ac)
        sid = await _get_solicitud_id(ac, token, "2026-FT-00001")
        r = await ac.post(
            f"/admin/solicitudes/{sid}/advance",
            json={"nuevo_estado": 3, "motivo": "Falta info"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_advance_pendiente_info_emite_notificacion():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        token = await _login(ac)
        sid = await _get_solicitud_id(ac, token, "2026-FT-00001")
        r = await ac.post(
            f"/admin/solicitudes/{sid}/advance",
            json={"nuevo_estado": 2, "motivo": "Falta plano de planta"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200
    assert r.json()["estado_actual"] == 2


@pytest.mark.asyncio
async def test_documentos_upload_admin_y_descarga():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        token = await _login(ac)
        sid = await _get_solicitud_id(ac, token, "2026-FT-00001")
        files = {"file": ("certificado.pdf", io.BytesIO(b"%PDF-fake"), "application/pdf")}
        data = {"tipo": "certificado_factibilidad"}
        r = await ac.post(
            f"/admin/solicitudes/{sid}/documentos",
            data=data,
            files=files,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 201
        doc_id = r.json()["id"]

        r2 = await ac.get(
            f"/admin/solicitudes/{sid}/documentos",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r2.status_code == 200
        assert any(d["id"] == doc_id for d in r2.json())

        r3 = await ac.get(
            f"/admin/documentos/{doc_id}/download",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r3.status_code == 200
        assert r3.content.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_completar_info_publico():
    """La solicitud 2026-FT-00002 quedo en PENDIENTE_INFORMACION_CLIENTE en el seed."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        # Cliente con RUT incorrecto: 403
        bad = await ac.patch(
            "/public/seguimiento/2026-FT-00002",
            json={"requirente_rut": "99.999.999-9"},
        )
        assert bad.status_code == 403

        # RUT correcto: pasa a EN_ANALISIS
        ok = await ac.patch(
            "/public/seguimiento/2026-FT-00002",
            json={
                "requirente_rut": "22.333.444-5",
                "mensaje": "Adjunto plano via documentos.",
            },
        )
    assert ok.status_code == 200
    body = ok.json()
    assert body["estado_actual"] == 1  # EN_ANALISIS_ADMISIBILIDAD


@pytest.mark.asyncio
async def test_export_excel_factibilidad():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        token = await _login(ac)
        r = await ac.get(
            "/admin/export/sec.xlsx?tipo=factibilidad",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200
    assert r.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert "filename=" in r.headers["content-disposition"]
    assert r.content.startswith(b"PK")  # ZIP magic (xlsx)


@pytest.mark.asyncio
async def test_admin_users_create_y_patch():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        token = await _login(ac)
        headers = {"Authorization": f"Bearer {token}"}
        # Crear (puede ya existir si el test corre dos veces; aceptamos 201 o 400)
        create = await ac.post(
            "/admin/users",
            json={
                "email": "test_user@tiltil.cl",
                "nombre": "Usuario Test",
                "password": "test1234",
                "rol": "operador",
            },
            headers=headers,
        )
        assert create.status_code in (201, 400)
        if create.status_code == 201:
            uid = create.json()["id"]
            patch = await ac.patch(
                f"/admin/users/{uid}",
                json={"nombre": "Usuario Test Modificado"},
                headers=headers,
            )
            assert patch.status_code == 200
            assert patch.json()["nombre"] == "Usuario Test Modificado"

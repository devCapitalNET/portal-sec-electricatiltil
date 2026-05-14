"""Tests basicos del flujo admin (login + listar) y publico (crear + seguimiento)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://test"


@pytest.mark.asyncio
async def test_login_admin_ok():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post("/auth/login", json={"email": "admin@tiltil.cl", "password": "admin123"})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["user"]["rol"] == "admin"


@pytest.mark.asyncio
async def test_login_credenciales_invalidas():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post("/auth/login", json={"email": "admin@tiltil.cl", "password": "wrong"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_listado_admin_requiere_jwt():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.get("/admin/solicitudes")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_listado_admin_ok():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        login = await ac.post("/auth/login", json={"email": "admin@tiltil.cl", "password": "admin123"})
        token = login.json()["access_token"]
        r = await ac.get("/admin/solicitudes", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert "items" in body and "total" in body


@pytest.mark.asyncio
async def test_publico_seguimiento():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.get("/public/seguimiento/2026-FT-00001")
    assert r.status_code == 200
    body = r.json()
    assert body["num_solicitud"] == "2026-FT-00001"


@pytest.mark.asyncio
async def test_publico_crear_factibilidad():
    payload = {
        "tipo_tramite": "factibilidad",
        "tipo_solicitud": 1,
        "requirente_rut": "20.111.222-3",
        "requirente_nombre": "Carlos Lopez",
        "requirente_direccion": "Av. Test 999, TilTil",
        "requirente_email": "carlos@test.cl",
        "propietario_rut": "20.111.222-3",
        "propietario_nombre": "Carlos Lopez",
        "propietario_email": "carlos@test.cl",
        "tipo_tension": 1,
        "potencia_solicitada": 5.5,
        "tipo_fase": 1,
        "concesion_id": "CONC123",
        "tipo_instalacion_id": 6,
        "identificador_conexion": "RT-POSTE-200",
        "ubicacion_empalme": 3,
        "direccion_instalacion": "Av. Test 999",
        "datum_id": 3,
        "tipo_zona_utm": 19,
        "coord_x": "349000.00000000",
        "coord_y": "6295000.00000000",
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post("/public/solicitudes/factibilidad", json=payload)
    assert r.status_code == 201
    body = r.json()
    assert body["num_solicitud"].startswith(f"{__import__('datetime').date.today().year}-FT-")

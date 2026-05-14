"""Tests de los 8 endpoints SEC (happy path + 404 + 401)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

BASE = "http://test"
BASIC = ("sec_demo", "demo123")


@pytest.mark.asyncio
async def test_factibilidad_por_num_solicitud_ok():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarSolicitudFactibilidad",
            json={"NUMSOLICITUD": "2026-FT-00001"},
            auth=BASIC,
        )
    assert r.status_code == 200
    body = r.json()
    assert body["SUCCESS"] is True
    assert body["NUMSOLICITUD"] == "2026-FT-00001"
    assert body["TIPOSOLICITUD"] == 1


@pytest.mark.asyncio
async def test_factibilidad_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarSolicitudFactibilidad",
            json={"NUMSOLICITUD": "9999-FT-99999"},
            auth=BASIC,
        )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_sec_endpoint_sin_auth_401():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarSolicitudFactibilidad",
            json={"NUMSOLICITUD": "2026-FT-00001"},
        )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_factibilidad_por_fecha_ingreso():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarFechaIngresoFactibilidad",
            json={"FECHAINGRESO": "2026-02-10"},
            auth=BASIC,
        )
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list)
    assert all(b["FECHAINGRESO"] == "2026-02-10" for b in body)


@pytest.mark.asyncio
async def test_factibilidad_por_rut():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarRUNRUTFactibilidad",
            json={"RUT_RUN": "12.345.678-9"},
            auth=BASIC,
        )
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list)
    assert len(body) >= 1


@pytest.mark.asyncio
async def test_conexion_por_num_solicitud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarNumSolicitud",
            json={"NUMSOLICITUD": "2026-CNX-00001"},
            auth=BASIC,
        )
    assert r.status_code == 200
    body = r.json()
    assert body["SUCCESS"] is True
    assert body["NUMSOLICITUD"] == "2026-CNX-00001"
    assert "PRESUPUESTO" in body


@pytest.mark.asyncio
async def test_conexion_por_fecha_ingreso():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarSolicitudPorFechaIngreso",
            json={"FECHAINGRESO": "2026-02-20"},
            auth=BASIC,
        )
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_factibilidad_no_devuelve_conexion():
    """El endpoint de factibilidad NO debe devolver registros de conexion."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as ac:
        r = await ac.post(
            "/consultarSolicitudFactibilidad",
            json={"NUMSOLICITUD": "2026-CNX-00001"},
            auth=BASIC,
        )
    assert r.status_code == 404

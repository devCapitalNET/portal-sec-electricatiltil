"""Configuracion pytest: un solo event loop para toda la sesion para evitar
conflictos con el pool de asyncpg compartido del engine creado a nivel modulo."""

import asyncio

import pytest


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

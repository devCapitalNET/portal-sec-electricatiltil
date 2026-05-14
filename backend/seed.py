"""Seed inicial: usuario admin, credencial SEC y 5 solicitudes demo."""

import asyncio
from datetime import date, time
from decimal import Decimal

from sqlalchemy import select

from app.core.enums import (
    Datum,
    DefinitivoProvisorio,
    EstadoActual,
    RolUsuario,
    TipoConsumo,
    TipoFase,
    TipoInstalacion,
    TipoSolicitud,
    TipoTension,
    TipoTramite,
    TipoZonaUTM,
    UbicacionEmpalme,
)
from app.core.security import hash_password
from app.database import SessionLocal
from app.models import SecCredential, Solicitud, SolicitudHistorial, User


async def seed_users(session) -> None:
    existing = (await session.execute(select(User).where(User.email == "admin@tiltil.cl"))).scalar_one_or_none()
    if existing:
        return
    session.add(
        User(
            email="admin@tiltil.cl",
            nombre="Administrador TilTil",
            password_hash=hash_password("admin123"),
            rol=RolUsuario.ADMIN,
            activo=True,
        )
    )
    session.add(
        User(
            email="operador@tiltil.cl",
            nombre="Operador TilTil",
            password_hash=hash_password("operador123"),
            rol=RolUsuario.OPERADOR,
            activo=True,
        )
    )


async def seed_sec_credential(session) -> None:
    existing = (
        await session.execute(select(SecCredential).where(SecCredential.username == "sec_demo"))
    ).scalar_one_or_none()
    if existing:
        return
    session.add(
        SecCredential(
            username="sec_demo",
            password_hash=hash_password("demo123"),
            nombre_consumidor="SEC - consumidor demo",
            activa=True,
        )
    )


def _base_solicitud(num: str, tipo_tramite: str, **overrides) -> Solicitud:
    base = dict(
        num_solicitud=num,
        tipo_tramite=tipo_tramite,
        tipo_solicitud=TipoSolicitud.CONEXION_NUEVA,
        fecha_ingreso=date(2026, 2, 10),
        fecha_ultima_actualizacion=date(2026, 2, 12),
        estado_actual=EstadoActual.EN_ANALISIS_ADMISIBILIDAD,
        requirente_rut="12.345.678-9",
        requirente_nombre="Juan Perez Soto",
        requirente_direccion="Av. Las Torres 123, TilTil",
        requirente_telefono="+56 9 1234 5678",
        requirente_email="juan.perez@correo.cl",
        propietario_rut="11.222.333-4",
        propietario_nombre="Constructora Las Torres SpA",
        propietario_direccion="Av. Kennedy 1234, Las Condes",
        propietario_telefono="+56 2 1234 5678",
        propietario_email="contacto@lastorres.cl",
        autorizacion_tercero=True,
        tipo_consumo_id=TipoConsumo.RESIDENCIAL,
        definitivo_provisorio=DefinitivoProvisorio.DEFINITIVO,
        tipo_tension=TipoTension.BT,
        potencia_solicitada=Decimal("15.50"),
        tipo_fase=TipoFase.TRIFASICO,
        concesion_id="CONC123",
        tipo_instalacion_id=TipoInstalacion.EMPALME,
        identificador_conexion="RT-POSTE-112",
        ubicacion_empalme=UbicacionEmpalme.POSTE,
        direccion_instalacion="Av. Las Torres 120, TilTil",
        datum_id=Datum.WGS84,
        tipo_zona_utm=TipoZonaUTM.HUSO_19,
        coord_x="349582.35214567",
        coord_y="6295785.12345678",
    )
    base.update(overrides)
    return Solicitud(**base)


async def seed_solicitudes(session) -> None:
    existing = (await session.execute(select(Solicitud).limit(1))).scalar_one_or_none()
    if existing:
        return

    solicitudes = [
        _base_solicitud(
            "2026-FT-00001",
            TipoTramite.FACTIBILIDAD,
            estado_actual=EstadoActual.ADMISIBLE,
            fecha_respuesta_empresa=date(2026, 2, 25),
            respuesta_factibilidad=True,
            observaciones="Factibilidad otorgada, sin estudios adicionales.",
        ),
        _base_solicitud(
            "2026-FT-00002",
            TipoTramite.FACTIBILIDAD,
            fecha_ingreso=date(2026, 3, 1),
            fecha_ultima_actualizacion=date(2026, 3, 1),
            estado_actual=EstadoActual.EN_ANALISIS_ADMISIBILIDAD,
            requirente_rut="22.333.444-5",
            requirente_nombre="Maria Gonzalez Soto",
            requirente_email="maria@correo.cl",
            potencia_solicitada=Decimal("8.00"),
            tipo_fase=TipoFase.MONOFASICO,
        ),
        _base_solicitud(
            "2026-FT-00003",
            TipoTramite.FACTIBILIDAD,
            fecha_ingreso=date(2026, 3, 5),
            fecha_ultima_actualizacion=date(2026, 3, 10),
            estado_actual=EstadoActual.INADMISIBLE,
            fecha_respuesta_empresa=date(2026, 3, 10),
            respuesta_factibilidad=False,
            estudios_tecnicos_requeridos=(
                "Se requiere estudio de ampliacion de red BT entre transformador TR-152 y camara CAM-078"
            ),
            causa_rechazo_notificacion="Capacidad de red insuficiente para potencia solicitada.",
        ),
        _base_solicitud(
            "2026-CNX-00001",
            TipoTramite.CONEXION,
            fecha_ingreso=date(2026, 2, 20),
            fecha_ultima_actualizacion=date(2026, 3, 12),
            estado_actual=EstadoActual.ADMISIBLE,
            fecha_respuesta_empresa=date(2026, 3, 5),
            fecha_visita_terreno=date(2026, 3, 1),
            hora_visita_terreno=time(10, 30),
            observaciones_visita="Inspeccion conjunta con el requirente para verificar punto de conexion.",
            respuesta_factibilidad=True,
            presupuesto=Decimal("250000.00"),
            detalle_presupuesto="Empalme BT 10mm2 (ER-1234): $150.000; Instalacion medidor (ER-5678): $100.000",
            modalidad_financiamiento="Empresa",
            codigos_vnr="1221313;121212;1212121",
            requiere_permisos_terceros=False,
            fecha_ingreso_notificacion=date(2026, 2, 22),
        ),
        _base_solicitud(
            "2026-CNX-00002",
            TipoTramite.CONEXION,
            tipo_solicitud=TipoSolicitud.AMPLIACION,
            fecha_ingreso=date(2026, 3, 1),
            fecha_ultima_actualizacion=date(2026, 3, 15),
            estado_actual=EstadoActual.CERRADA,
            fecha_respuesta_empresa=date(2026, 3, 10),
            fecha_conexion=date(2026, 3, 15),
            fecha_entrega_cliente_id=date(2026, 3, 15),
            respuesta_factibilidad=True,
            cliente_id="1234567-8",
            medidor_id="MED12345",
            numero_medidor="1234567890",
            marca_medidor="Elster",
            modelo_medidor="A1500",
            punto_consumo_id="PC-1234567890",
            presupuesto=Decimal("350000.00"),
            detalle_presupuesto="Ampliacion empalme MT, cambio medidor y obras civiles.",
            modalidad_financiamiento="Mixto",
            observaciones="Ampliacion ejecutada y conectada.",
        ),
    ]
    for s in solicitudes:
        session.add(s)
        await session.flush()
        session.add(
            SolicitudHistorial(
                solicitud_id=s.id,
                estado_anterior=None,
                estado_nuevo=s.estado_actual,
                motivo="Seed inicial",
                usuario_id=None,
            )
        )


async def main() -> None:
    async with SessionLocal() as session:
        await seed_users(session)
        await seed_sec_credential(session)
        await seed_solicitudes(session)
        await session.commit()
    print("Seed completado.")


if __name__ == "__main__":
    asyncio.run(main())

"""Mapeo ORM Solicitud -> dict con campos UPPERCASE conforme Anexo Tecnico N1 SEC.

Aplica las reglas de exigibilidad del Anexo Tecnico N2:
- En etapa factibilidad: requirente obligatorio, cliente no.
- En etapas posteriores a conexion: cliente_id, fecha_conexion, medidor obligatorios.
- Campos de presupuesto solo en estados >= 4 (admisible).
"""

from datetime import date, time
from decimal import Decimal
from typing import Any

from app.core.enums import EstadoActual, TipoTramite
from app.models import Solicitud


def _fmt(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, time):
        return value.strftime("%H:%M:%S")
    if isinstance(value, Decimal):
        return float(value)
    return value


def solicitud_to_factibilidad_dict(s: Solicitud) -> dict[str, Any]:
    """Mapeo response para los 4 endpoints SEC de factibilidad (Anexo 1 seccion 1.1)."""
    return {
        "SUCCESS": True,
        "NUMSOLICITUD": s.num_solicitud,
        "TIPOSOLICITUD": s.tipo_solicitud,
        "FECHAINGRESO": _fmt(s.fecha_ingreso),
        "FECHAULTIMAACTUALIZACION": _fmt(s.fecha_ultima_actualizacion),
        "ESTADOACTUAL": s.estado_actual,
        "REQUIRENTE_RUT_RUN": s.requirente_rut,
        "REQUIRENTE_NOMBRECOMPLETO_RAZONSOCIAL": s.requirente_nombre,
        "REQUIRENTE_DIRECCION": s.requirente_direccion,
        "REQUIRENTE_TELEFONO": s.requirente_telefono,
        "REQUIRENTE_EMAIL": s.requirente_email,
        "PROPIETARIO_RUN_RUT": s.propietario_rut,
        "PROPIETARIO_NOMBRECOMPLETO_RAZONSOCIAL": s.propietario_nombre,
        "PROPIETARIO_DIRECCION": s.propietario_direccion,
        "PROPIETARIO_TELEFONO": s.propietario_telefono,
        "PROPIETARIO_EMAIL": s.propietario_email,
        "AUTORIZACIONTERCERO": s.autorizacion_tercero,
        "TIPO_CONSUMO_ID": s.tipo_consumo_id,
        "DEFINITIVOOPROVISORIO": s.definitivo_provisorio,
        "CLIENTE_ID": s.cliente_id,
        "MEDIDOR_ID": s.medidor_id,
        "NUMERO_MEDIDOR": s.numero_medidor,
        "PUNTO_CONSUMO_ID": s.punto_consumo_id,
        "TIPO_TENSION": s.tipo_tension,
        "POTENCIA_SOLICITADA": _fmt(s.potencia_solicitada),
        "TIPO_FASE": s.tipo_fase,
        "CONCESION_ID": s.concesion_id,
        "DIRECCIONINSTALACION": s.direccion_instalacion,
        "UBICACIONEMPALME": s.ubicacion_empalme,
        "DATUM_ID": s.datum_id,
        "TIPO_ZONA_UTM": s.tipo_zona_utm,
        "X": s.coord_x,
        "Y": s.coord_y,
        "FECHARESPUESTAEMPRESA": _fmt(s.fecha_respuesta_empresa),
        "TIPO_INSTALACION_ID": s.tipo_instalacion_id,
        "IDENTIFICADOR_CONEXION": s.identificador_conexion,
        "RESPUESTAFACTIBILIDAD": s.respuesta_factibilidad,
        "ESTUDIOS_TECNICOS_REQUERIDOS": s.estudios_tecnicos_requeridos,
        "OBSERVACIONES": s.observaciones,
    }


def solicitud_to_conexion_dict(s: Solicitud) -> dict[str, Any]:
    """Mapeo response para los 4 endpoints SEC de conexion/ampliacion (Anexo 1 seccion 2.1)."""
    estado_post_admisible = s.estado_actual >= EstadoActual.ADMISIBLE
    return {
        "SUCCESS": True,
        "NUMSOLICITUD": s.num_solicitud,
        "TIPOSOLICITUD": s.tipo_solicitud,
        "FECHAINGRESO": _fmt(s.fecha_ingreso),
        "FECHAULTIMAACTUALIZACION": _fmt(s.fecha_ultima_actualizacion),
        "ESTADOACTUAL": s.estado_actual,
        "REQUIRENTE_RUT_RUN": s.requirente_rut,
        "REQUIRENTE_NOMBRECOMPLETO_RAZONSOCIAL": s.requirente_nombre,
        "REQUIRENTE_DIRECCION": s.requirente_direccion,
        "REQUIRENTE_TELEFONO": s.requirente_telefono,
        "REQUIRENTE_EMAIL": s.requirente_email,
        "PROPIETARIO_RUN_RUT": s.propietario_rut,
        "PROPIETARIO_NOMBRECOMPLETO_RAZONSOCIAL": s.propietario_nombre,
        "PROPIETARIO_DIRECCION": s.propietario_direccion,
        "PROPIETARIO_TELEFONO": s.propietario_telefono,
        "PROPIETARIO_EMAIL": s.propietario_email,
        "AUTORIZACIONTERCERO": s.autorizacion_tercero,
        "TIPO_CONSUMO_ID": s.tipo_consumo_id,
        "DEFINITIVOOPROVISORIO": s.definitivo_provisorio,
        "PUNTO_CONSUMO_ID": s.punto_consumo_id,
        "TIPO_TENSION": s.tipo_tension,
        "POTENCIA_SOLICITADA": _fmt(s.potencia_solicitada),
        "TIPO_FASE": s.tipo_fase,
        "CONCESION_ID": s.concesion_id,
        "DIRECCIONINSTALACION": s.direccion_instalacion,
        "UBICACIONEMPALME": s.ubicacion_empalme,
        "DATUM_ID": s.datum_id,
        "TIPO_ZONA_UTM": s.tipo_zona_utm,
        "X": s.coord_x,
        "Y": s.coord_y,
        "FECHARESPUESTAEMPRESA": _fmt(s.fecha_respuesta_empresa),
        "TIPO_INSTALACION_ID": s.tipo_instalacion_id,
        "IDENTIFICADOR_CONEXION": s.identificador_conexion,
        "RESPUESTAFACTIBILIDAD": s.respuesta_factibilidad,
        "ESTUDIOS_TECNICOS_REQUERIDOS": s.estudios_tecnicos_requeridos,
        "FECHAVISITATERRENO": _fmt(s.fecha_visita_terreno),
        "HORAVISITATERRENO": _fmt(s.hora_visita_terreno),
        "OBSERVACIONESVISITA": s.observaciones_visita,
        "PRESUPUESTO": _fmt(s.presupuesto) if estado_post_admisible else None,
        "DETALLEPRESUPUESTO": s.detalle_presupuesto if estado_post_admisible else None,
        "MODALIDADFINANCIAMIENTO": s.modalidad_financiamiento if estado_post_admisible else None,
        "CODIGOSVNR": s.codigos_vnr,
        "REQUIEREPERMISOSTERCEROS": s.requiere_permisos_terceros,
        "FECHAINGRESONOTIFICACION": _fmt(s.fecha_ingreso_notificacion),
        "FECHARECHAZONOTIFICACION": _fmt(s.fecha_rechazo_notificacion),
        "CAUSARECHAZONOTIFICACION": s.causa_rechazo_notificacion,
        "FECHACONEXION": _fmt(s.fecha_conexion),
        "FECHAENTREGACLIENTE_ID": _fmt(s.fecha_entrega_cliente_id),
        "CLIENTE_ID": s.cliente_id,
        "MEDIDOR_ID": s.medidor_id,
        "NUMERO_MEDIDOR": s.numero_medidor,
        "MARCA_MEDIDOR": s.marca_medidor,
        "MODELO_MEDIDOR": s.modelo_medidor,
        "OBSERVACIONES": s.observaciones,
    }


def solicitud_to_sec_dict(s: Solicitud) -> dict[str, Any]:
    if s.tipo_tramite == TipoTramite.FACTIBILIDAD:
        return solicitud_to_factibilidad_dict(s)
    return solicitud_to_conexion_dict(s)

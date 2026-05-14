"""Catalogos SEC - Anexo Tecnico N1 (paginas 6-9 y 19-23) NTCSSD Art. 5-1 a 5-5."""

from enum import IntEnum, StrEnum


class TipoTramite(StrEnum):
    FACTIBILIDAD = "factibilidad"
    CONEXION = "conexion"


class TipoSolicitud(IntEnum):
    CONEXION_NUEVA = 1
    AMPLIACION = 2


class EstadoActual(IntEnum):
    INGRESADA = 0
    EN_ANALISIS_ADMISIBILIDAD = 1
    PENDIENTE_INFORMACION_CLIENTE = 2
    INADMISIBLE = 3
    ADMISIBLE = 4
    ANULADA = 5
    CERRADA = 6


class TipoConsumo(IntEnum):
    RESIDENCIAL = 1
    COMERCIAL = 2
    INDUSTRIAL = 3
    AGRICOLA = 4
    FISCAL = 5
    MUNICIPAL = 6
    FFCC = 7
    UTILIDAD_PUBLICA = 8
    RESIDENCIAL_CON_NEGOCIO = 9
    HOSPITAL = 10
    CARCEL = 11
    SEMAFORO = 12
    ALUMBRADO_PUBLICO = 13
    OTRO = 14


class DefinitivoProvisorio(IntEnum):
    DEFINITIVO = 1
    PROVISORIO = 2


class TipoTension(IntEnum):
    BT = 1
    MT = 2


class TipoFase(IntEnum):
    MONOFASICO = 1
    BIFASICO = 2
    TRIFASICO = 3


class UbicacionEmpalme(IntEnum):
    PROPIEDAD_PRIVADA = 1
    PROPIEDAD_PUBLICA = 2
    POSTE = 3
    NICHO = 4
    EDIFICACION = 5
    FACHADA = 6
    ESTRUCTURA_SUBESTACION = 7


class TipoInstalacion(IntEnum):
    GENERACION_ALMACENAMIENTO = 1
    BAJADA = 2
    BOVEDA = 3
    CAMARA = 4
    CANALIZACION = 5
    EMPALME = 6
    ENMALLE = 7
    EQUIPOS_OPERACION = 8
    ESTRUCTURAS_PORTANTES = 9
    ESTRUCTURAS_VARIAS = 10
    MEDIDOR = 11
    POSTE = 12
    EQUIPOS_MONITOREO_OTROS = 13
    ESTRUCTURA_SUBESTACION = 14
    ESTRUCTURA_EQUIPOS = 15
    TIRANTE = 16
    TOMA_TIERRA = 17
    TRAMO = 18
    TRANSFORMADOR = 19
    OBRAS_CIVILES = 20


class Datum(IntEnum):
    PSAD56_CANOA_VENEZUELA = 1
    SAD69 = 2
    WGS84 = 3
    SIRGAS_CHILE = 4


class TipoZonaUTM(IntEnum):
    NO_APLICA = -1
    HUSO_18 = 18
    HUSO_19 = 19


class RolUsuario(StrEnum):
    ADMIN = "admin"
    OPERADOR = "operador"


ENUM_DICTIONARIES = {
    "TipoSolicitud": {
        1: "Conexion nueva",
        2: "Ampliacion",
    },
    "EstadoActual": {
        0: "Ingresada",
        1: "En analisis de admisibilidad",
        2: "Pendiente de informacion del cliente",
        3: "Inadmisible",
        4: "Admisible",
        5: "Anulada",
        6: "Cerrada",
    },
    "TipoConsumo": {
        1: "Residencial",
        2: "Comercial",
        3: "Industrial",
        4: "Agricola",
        5: "Fiscal",
        6: "Municipal",
        7: "F.F.C.C.",
        8: "Utilidad Publica",
        9: "Residencial con negocio",
        10: "Hospital",
        11: "Carcel",
        12: "Semaforo",
        13: "Alumbrado publico",
        14: "Otro",
    },
    "TipoTension": {1: "BT", 2: "MT"},
    "TipoFase": {1: "Monofasico", 2: "Bifasico", 3: "Trifasico"},
    "DefinitivoProvisorio": {1: "Definitivo", 2: "Provisorio"},
    "UbicacionEmpalme": {
        1: "Propiedad privada",
        2: "Propiedad publica",
        3: "Poste",
        4: "Nicho",
        5: "Edificacion",
        6: "Fachada",
        7: "Estructura de subestacion",
    },
    "TipoInstalacion": {
        1: "Generacion, almacenamiento",
        2: "Bajada",
        3: "Boveda",
        4: "Camara",
        5: "Canalizacion",
        6: "Empalme",
        7: "Enmalle",
        8: "Equipos de Operacion",
        9: "Estructuras Portantes",
        10: "Estructuras Varias",
        11: "Medidor",
        12: "Poste",
        13: "Equipos de monitoreo y otros",
        14: "Estructura de Subestacion",
        15: "Estructura de Equipos",
        16: "Tirante",
        17: "Toma Tierra",
        18: "Tramo",
        19: "Transformador",
        20: "Obras Civiles, Caseta Obras Civiles",
    },
    "Datum": {
        1: "PSAD56 Canoa-Venezuela",
        2: "SAD69",
        3: "WGS84",
        4: "SIRGAS Chile",
    },
    "TipoZonaUTM": {-1: "No aplica", 18: "Huso 18", 19: "Huso 19"},
}

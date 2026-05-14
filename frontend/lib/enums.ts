export const TIPO_SOLICITUD: Record<number, string> = {
  1: "Conexión nueva",
  2: "Ampliación",
};

export const ESTADO_ACTUAL: Record<number, string> = {
  0: "Ingresada",
  1: "En análisis de admisibilidad",
  2: "Pendiente de información del cliente",
  3: "Inadmisible",
  4: "Admisible",
  5: "Anulada",
  6: "Cerrada",
};

export const ESTADO_COLOR: Record<number, string> = {
  0: "badge-blue",
  1: "badge-yellow",
  2: "badge-yellow",
  3: "badge-red",
  4: "badge-green",
  5: "badge-gray",
  6: "badge-gray",
};

export const TIPO_CONSUMO: Record<number, string> = {
  1: "Residencial",
  2: "Comercial",
  3: "Industrial",
  4: "Agrícola",
  5: "Fiscal",
  6: "Municipal",
  7: "F.F.C.C.",
  8: "Utilidad Pública",
  9: "Residencial con negocio",
  10: "Hospital",
  11: "Cárcel",
  12: "Semáforo",
  13: "Alumbrado público",
  14: "Otro",
};

export const TIPO_TENSION: Record<number, string> = { 1: "Baja Tensión (BT)", 2: "Media Tensión (MT)" };
export const TIPO_FASE: Record<number, string> = { 1: "Monofásico", 2: "Bifásico", 3: "Trifásico" };
export const DEFINITIVO_PROVISORIO: Record<number, string> = { 1: "Definitivo", 2: "Provisorio" };

export const UBICACION_EMPALME: Record<number, string> = {
  1: "Propiedad privada",
  2: "Propiedad pública",
  3: "Poste",
  4: "Nicho",
  5: "Edificación",
  6: "Fachada",
  7: "Estructura de subestación",
};

export const TIPO_INSTALACION: Record<number, string> = {
  1: "Generación / almacenamiento",
  2: "Bajada",
  3: "Bóveda",
  4: "Cámara",
  5: "Canalización",
  6: "Empalme",
  7: "Enmalle",
  8: "Equipos de Operación",
  9: "Estructuras Portantes",
  10: "Estructuras Varias",
  11: "Medidor",
  12: "Poste",
  13: "Equipos de monitoreo y otros",
  14: "Estructura de Subestación",
  15: "Estructura de Equipos",
  16: "Tirante",
  17: "Toma Tierra",
  18: "Tramo",
  19: "Transformador",
  20: "Obras Civiles",
};

export const DATUM: Record<number, string> = {
  1: "PSAD56 Canoa-Venezuela",
  2: "SAD69",
  3: "WGS84",
  4: "SIRGAS Chile",
};

export const TIPO_ZONA_UTM: Record<number, string> = { [-1]: "No aplica", 18: "Huso 18", 19: "Huso 19" };

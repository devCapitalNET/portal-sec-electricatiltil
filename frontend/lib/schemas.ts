import { z } from "zod";

export const solicitudPublicaSchema = z.object({
  tipo_tramite: z.enum(["factibilidad", "conexion"]),
  tipo_solicitud: z.coerce.number().int().min(1).max(2),

  requirente_rut: z.string().min(7, "RUT requerido").max(15),
  requirente_nombre: z.string().min(3, "Nombre requerido").max(200),
  requirente_direccion: z.string().min(3, "Dirección requerida").max(200),
  requirente_telefono: z.string().max(20).optional().or(z.literal("")),
  requirente_email: z.string().email("Email inválido"),

  propietario_rut: z.string().min(7).max(15),
  propietario_nombre: z.string().min(3).max(200),
  propietario_direccion: z.string().max(200).optional().or(z.literal("")),
  propietario_telefono: z.string().max(20).optional().or(z.literal("")),
  propietario_email: z.string().email(),
  autorizacion_tercero: z.boolean().optional(),

  tipo_consumo_id: z.coerce.number().int().min(1).max(14).optional(),
  definitivo_provisorio: z.coerce.number().int().min(1).max(2).optional(),
  tipo_tension: z.coerce.number().int().min(1).max(2),
  potencia_solicitada: z.coerce.number().positive("Potencia debe ser positiva"),
  tipo_fase: z.coerce.number().int().min(1).max(3),
  concesion_id: z.string().min(1).max(10),
  tipo_instalacion_id: z.coerce.number().int().min(1).max(20),
  identificador_conexion: z.string().min(1).max(50),
  ubicacion_empalme: z.coerce.number().int().min(1).max(7),

  direccion_instalacion: z.string().min(3).max(200),
  datum_id: z.coerce.number().int().min(1).max(4),
  tipo_zona_utm: z.coerce.number().int(),
  coord_x: z.string().min(1).max(19),
  coord_y: z.string().min(1).max(19),

  cliente_id: z.string().max(30).optional().or(z.literal("")),
  observaciones: z.string().max(500).optional().or(z.literal("")),
});

export type SolicitudPublicaForm = z.infer<typeof solicitudPublicaSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginForm = z.infer<typeof loginSchema>;

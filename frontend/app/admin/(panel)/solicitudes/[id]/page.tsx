import Link from "next/link";

import { SolicitudDetailTabs } from "@/components/SolicitudDetailTabs";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { ESTADO_ACTUAL, ESTADO_COLOR, TIPO_SOLICITUD } from "@/lib/enums";

type HistorialItem = {
  id: string;
  estado_anterior: number | null;
  estado_nuevo: number;
  motivo: string | null;
  created_at: string;
};

type Solicitud = {
  id: string;
  num_solicitud: string;
  tipo_tramite: string;
  tipo_solicitud: number;
  estado_actual: number;
  fecha_ingreso: string;
  fecha_ultima_actualizacion: string;
  fecha_respuesta_empresa: string | null;
  fecha_visita_terreno: string | null;
  fecha_conexion: string | null;
  requirente_rut: string;
  requirente_nombre: string;
  requirente_email: string;
  requirente_telefono: string | null;
  requirente_direccion: string;
  propietario_rut: string;
  propietario_nombre: string;
  propietario_email: string;
  propietario_telefono: string | null;
  propietario_direccion: string | null;
  direccion_instalacion: string;
  tipo_tension: number;
  tipo_fase: number;
  potencia_solicitada: number;
  concesion_id: string;
  identificador_conexion: string;
  coord_x: string;
  coord_y: string;
  respuesta_factibilidad: boolean | null;
  estudios_tecnicos_requeridos: string | null;
  causa_rechazo_notificacion: string | null;
  observaciones: string | null;
  observaciones_visita: string | null;
  presupuesto: number | null;
  detalle_presupuesto: string | null;
  modalidad_financiamiento: string | null;
  cliente_id: string | null;
  numero_medidor: string | null;
  marca_medidor: string | null;
  modelo_medidor: string | null;
  historial: HistorialItem[];
};

export default async function SolicitudDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();
  const s = await api<Solicitud>(`/admin/solicitudes/${id}`, { token });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/solicitudes" className="text-sm text-[#efa829] hover:underline font-medium">
            ← Volver al listado
          </Link>
          <h1 className="text-2xl font-bold font-mono mt-1">{s.num_solicitud}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 flex-wrap">
            <span className="capitalize">{s.tipo_tramite}</span>
            <span>·</span>
            <span>{TIPO_SOLICITUD[s.tipo_solicitud]}</span>
            <span>·</span>
            <span className={ESTADO_COLOR[s.estado_actual] || "badge-gray"}>
              {ESTADO_ACTUAL[s.estado_actual]}
            </span>
            <span>·</span>
            <span className="text-xs text-gray-500">
              Ingresada {s.fecha_ingreso} · Actualizada {s.fecha_ultima_actualizacion}
            </span>
          </div>
        </div>
        <Link href={`/admin/solicitudes/${s.id}/avanzar`} className="btn-primary">
          Avanzar solicitud →
        </Link>
      </div>

      <SolicitudDetailTabs s={s} />
    </div>
  );
}

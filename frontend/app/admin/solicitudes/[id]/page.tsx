import Link from "next/link";

import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { ESTADO_ACTUAL, ESTADO_COLOR, TIPO_SOLICITUD, TIPO_TENSION, TIPO_FASE } from "@/lib/enums";
import { TransicionEstadoForm } from "@/components/TransicionEstadoForm";

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
  requirente_rut: string;
  requirente_nombre: string;
  requirente_email: string;
  requirente_telefono: string | null;
  requirente_direccion: string;
  propietario_rut: string;
  propietario_nombre: string;
  propietario_email: string;
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
  observaciones: string | null;
  presupuesto: number | null;
  detalle_presupuesto: string | null;
  modalidad_financiamiento: string | null;
  cliente_id: string | null;
  numero_medidor: string | null;
  marca_medidor: string | null;
  modelo_medidor: string | null;
  fecha_conexion: string | null;
  historial: HistorialItem[];
};

export default async function SolicitudDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();
  const s = await api<Solicitud>(`/admin/solicitudes/${id}`, { token });

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <dt className="text-xs text-slate-500 uppercase">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "—"}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/solicitudes" className="text-sm text-brand hover:underline">
            ← Volver al listado
          </Link>
          <h1 className="text-2xl font-bold font-mono mt-1">{s.num_solicitud}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
            <span className="capitalize">{s.tipo_tramite}</span>
            <span>·</span>
            <span>{TIPO_SOLICITUD[s.tipo_solicitud]}</span>
            <span>·</span>
            <span className={ESTADO_COLOR[s.estado_actual] || "badge-gray"}>{ESTADO_ACTUAL[s.estado_actual]}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Requirente</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="RUT" value={s.requirente_rut} />
              <Field label="Nombre" value={s.requirente_nombre} />
              <Field label="Dirección" value={s.requirente_direccion} />
              <Field label="Email" value={s.requirente_email} />
              <Field label="Teléfono" value={s.requirente_telefono} />
            </dl>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Propietario</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="RUT" value={s.propietario_rut} />
              <Field label="Nombre" value={s.propietario_nombre} />
              <Field label="Email" value={s.propietario_email} />
            </dl>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Datos técnicos y ubicación</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Dirección instalación" value={s.direccion_instalacion} />
              <Field label="Tipo de tensión" value={TIPO_TENSION[s.tipo_tension]} />
              <Field label="Potencia (kW)" value={s.potencia_solicitada} />
              <Field label="Fase" value={TIPO_FASE[s.tipo_fase]} />
              <Field label="Concesión" value={s.concesion_id} />
              <Field label="ID Conexión" value={s.identificador_conexion} />
              <Field label="Coord X" value={s.coord_x} />
              <Field label="Coord Y" value={s.coord_y} />
            </dl>
          </div>

          {s.tipo_tramite === "conexion" && (
            <div className="card">
              <h2 className="font-semibold mb-4">Conexión / Cliente</h2>
              <dl className="grid grid-cols-2 gap-4">
                <Field label="N° cliente" value={s.cliente_id} />
                <Field label="N° medidor" value={s.numero_medidor} />
                <Field label="Marca medidor" value={s.marca_medidor} />
                <Field label="Modelo medidor" value={s.modelo_medidor} />
                <Field label="Fecha conexión" value={s.fecha_conexion} />
                <Field label="Presupuesto" value={s.presupuesto} />
                <Field label="Modalidad financiamiento" value={s.modalidad_financiamiento} />
                <Field label="Detalle presupuesto" value={s.detalle_presupuesto} />
              </dl>
            </div>
          )}

          <div className="card">
            <h2 className="font-semibold mb-4">Respuesta de factibilidad</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field
                label="Factibilidad"
                value={s.respuesta_factibilidad === null ? "—" : s.respuesta_factibilidad ? "Vigente" : "No vigente"}
              />
              <Field label="Fecha respuesta empresa" value={s.fecha_respuesta_empresa} />
              <div className="col-span-2">
                <Field label="Estudios técnicos requeridos" value={s.estudios_tecnicos_requeridos} />
              </div>
              <div className="col-span-2">
                <Field label="Observaciones" value={s.observaciones} />
              </div>
            </dl>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">Transicionar estado</h2>
            <TransicionEstadoForm id={s.id} estadoActual={s.estado_actual} />
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4">Historial</h2>
            <ol className="space-y-3">
              {s.historial.map((h) => (
                <li key={h.id} className="border-l-2 border-brand pl-3">
                  <div className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString("es-CL")}</div>
                  <div className="text-sm">
                    {h.estado_anterior !== null ? `${ESTADO_ACTUAL[h.estado_anterior]} → ` : ""}
                    <strong>{ESTADO_ACTUAL[h.estado_nuevo]}</strong>
                  </div>
                  {h.motivo && <div className="text-xs text-slate-600 mt-1">{h.motivo}</div>}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

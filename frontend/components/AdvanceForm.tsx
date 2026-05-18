"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ESTADO_ACTUAL } from "@/lib/enums";
import { apiUrl } from "@/lib/assets";

const ESTADO_HELP: Record<number, string> = {
  0: "Ingresada — estado inicial al recibirse la solicitud.",
  1: "En análisis de admisibilidad — la empresa está revisando los antecedentes.",
  2: "Pendiente de información del cliente — se requieren datos adicionales (motivo obligatorio, será enviado por correo).",
  3: "Inadmisible — la solicitud no cumple los requisitos. Requiere estudios técnicos requeridos.",
  4: "Admisible — la solicitud cumple los requisitos y avanza.",
  5: "Anulada — la solicitud se cierra sin continuar.",
  6: "Cerrada — la solicitud concluyó sin acciones pendientes.",
};

type Props = {
  id: string;
  numSolicitud: string;
  tipoTramite: string;
  estadoActual: number;
  presupuestoActual: number | null;
  estudiosActual: string | null;
};

type FormState = {
  nuevo_estado: number;
  motivo: string;
  respuesta_factibilidad: "" | "true" | "false";
  estudios_tecnicos_requeridos: string;
  causa_rechazo_notificacion: string;
  fecha_respuesta_empresa: string;
  fecha_visita_terreno: string;
  fecha_conexion: string;
  presupuesto: string;
  detalle_presupuesto: string;
  modalidad_financiamiento: string;
  cliente_id: string;
  numero_medidor: string;
  marca_medidor: string;
  modelo_medidor: string;
  observaciones: string;
};

const TODAY = new Date().toISOString().slice(0, 10);

export function AdvanceForm({
  id,
  numSolicitud,
  tipoTramite,
  estadoActual,
  estudiosActual,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    nuevo_estado: estadoActual === 0 ? 1 : estadoActual,
    motivo: "",
    respuesta_factibilidad: "",
    estudios_tecnicos_requeridos: estudiosActual ?? "",
    causa_rechazo_notificacion: "",
    fecha_respuesta_empresa: TODAY,
    fecha_visita_terreno: "",
    fecha_conexion: "",
    presupuesto: "",
    detalle_presupuesto: "",
    modalidad_financiamiento: "",
    cliente_id: "",
    numero_medidor: "",
    marca_medidor: "",
    modelo_medidor: "",
    observaciones: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const destino = form.nuevo_estado;
  const isConexion = tipoTramite === "conexion";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: Record<string, unknown> = { nuevo_estado: destino };
      if (form.motivo) body.motivo = form.motivo;

      if (form.respuesta_factibilidad)
        body.respuesta_factibilidad = form.respuesta_factibilidad === "true";
      if (form.estudios_tecnicos_requeridos)
        body.estudios_tecnicos_requeridos = form.estudios_tecnicos_requeridos;
      if (form.causa_rechazo_notificacion)
        body.causa_rechazo_notificacion = form.causa_rechazo_notificacion;
      if (form.fecha_respuesta_empresa) body.fecha_respuesta_empresa = form.fecha_respuesta_empresa;
      if (form.fecha_visita_terreno) body.fecha_visita_terreno = form.fecha_visita_terreno;
      if (form.fecha_conexion) body.fecha_conexion = form.fecha_conexion;
      if (form.presupuesto) body.presupuesto = Number(form.presupuesto);
      if (form.detalle_presupuesto) body.detalle_presupuesto = form.detalle_presupuesto;
      if (form.modalidad_financiamiento) body.modalidad_financiamiento = form.modalidad_financiamiento;
      if (form.cliente_id) body.cliente_id = form.cliente_id;
      if (form.numero_medidor) body.numero_medidor = form.numero_medidor;
      if (form.marca_medidor) body.marca_medidor = form.marca_medidor;
      if (form.modelo_medidor) body.modelo_medidor = form.modelo_medidor;
      if (form.observaciones) body.observaciones = form.observaciones;

      const res = await fetch(apiUrl(`/api/admin/solicitudes/${id}/advance`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.error || data?.detail || `Error ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      router.push(`/admin/solicitudes/${id}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="card space-y-4">
        <h3 className="text-lg font-semibold">1. Estado destino</h3>
        <div>
          <label className="label">Nuevo estado</label>
          <select
            className="input"
            value={destino}
            onChange={(e) => update("nuevo_estado", Number(e.target.value))}
          >
            {Object.entries(ESTADO_ACTUAL).map(([eid, label]) => (
              <option key={eid} value={eid}>
                {eid}. {label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">{ESTADO_HELP[destino]}</p>
        </div>
        <div>
          <label className="label">Motivo / nota interna</label>
          <textarea
            className="input"
            rows={3}
            value={form.motivo}
            onChange={(e) => update("motivo", e.target.value)}
            placeholder={
              destino === 2
                ? "Indica al cliente qué información debe completar (será enviado por correo)"
                : "Opcional"
            }
          />
        </div>
      </section>

      {(destino === 3 || destino === 4) && (
        <section className="card space-y-4">
          <h3 className="text-lg font-semibold">2. Respuesta de factibilidad</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Respuesta de factibilidad</label>
              <select
                className="input"
                value={form.respuesta_factibilidad}
                onChange={(e) =>
                  update("respuesta_factibilidad", e.target.value as FormState["respuesta_factibilidad"])
                }
              >
                <option value="">—</option>
                <option value="true">Vigente (factible)</option>
                <option value="false">No vigente (no factible)</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha respuesta empresa</label>
              <input
                type="date"
                className="input"
                value={form.fecha_respuesta_empresa}
                onChange={(e) => update("fecha_respuesta_empresa", e.target.value)}
              />
            </div>
          </div>
          {destino === 3 && (
            <>
              <div>
                <label className="label">
                  Estudios técnicos requeridos <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.estudios_tecnicos_requeridos}
                  onChange={(e) => update("estudios_tecnicos_requeridos", e.target.value)}
                  placeholder="Detalla los estudios/refuerzos necesarios."
                  required
                />
              </div>
              <div>
                <label className="label">Causa de rechazo (notificada al cliente)</label>
                <input
                  className="input"
                  value={form.causa_rechazo_notificacion}
                  onChange={(e) => update("causa_rechazo_notificacion", e.target.value)}
                  placeholder="Capacidad de red insuficiente, etc."
                />
              </div>
            </>
          )}
        </section>
      )}

      {isConexion && (destino === 4 || destino === 6) && (
        <section className="card space-y-4">
          <h3 className="text-lg font-semibold">3. Datos de conexión y presupuesto</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Presupuesto (CLP)</label>
              <input
                type="number"
                className="input"
                value={form.presupuesto}
                onChange={(e) => update("presupuesto", e.target.value)}
                step="1"
              />
            </div>
            <div>
              <label className="label">Modalidad de financiamiento</label>
              <input
                className="input"
                value={form.modalidad_financiamiento}
                onChange={(e) => update("modalidad_financiamiento", e.target.value)}
                placeholder="Empresa / Mixto / Cliente"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Detalle de presupuesto</label>
              <textarea
                className="input"
                rows={2}
                value={form.detalle_presupuesto}
                onChange={(e) => update("detalle_presupuesto", e.target.value)}
              />
            </div>
            <div>
              <label className="label">N° de Cliente (boleta)</label>
              <input
                className="input"
                value={form.cliente_id}
                onChange={(e) => update("cliente_id", e.target.value)}
              />
            </div>
            <div>
              <label className="label">N° medidor</label>
              <input
                className="input"
                value={form.numero_medidor}
                onChange={(e) => update("numero_medidor", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Marca medidor</label>
              <input
                className="input"
                value={form.marca_medidor}
                onChange={(e) => update("marca_medidor", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Modelo medidor</label>
              <input
                className="input"
                value={form.modelo_medidor}
                onChange={(e) => update("modelo_medidor", e.target.value)}
              />
            </div>
            {destino === 4 && (
              <div>
                <label className="label">Fecha visita terreno</label>
                <input
                  type="date"
                  className="input"
                  value={form.fecha_visita_terreno}
                  onChange={(e) => update("fecha_visita_terreno", e.target.value)}
                />
              </div>
            )}
            {destino === 6 && (
              <div>
                <label className="label">Fecha de conexión</label>
                <input
                  type="date"
                  className="input"
                  value={form.fecha_conexion}
                  onChange={(e) => update("fecha_conexion", e.target.value)}
                />
              </div>
            )}
          </div>
        </section>
      )}

      <section className="card space-y-3">
        <h3 className="text-lg font-semibold">Observaciones (cierre)</h3>
        <textarea
          className="input"
          rows={2}
          value={form.observaciones}
          onChange={(e) => update("observaciones", e.target.value)}
          placeholder="Texto que quedará visible en el detalle público."
        />
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Solicitud <span className="font-mono">{numSolicitud}</span>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/solicitudes/${id}`)}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Avanzando…" : "Confirmar avance"}
          </button>
        </div>
      </div>
    </form>
  );
}

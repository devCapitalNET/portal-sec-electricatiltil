"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EditableFields = {
  requirente_telefono?: string | null;
  requirente_direccion?: string | null;
  propietario_direccion?: string | null;
  propietario_telefono?: string | null;
  observaciones?: string | null;
  observaciones_visita?: string | null;
  fecha_visita_terreno?: string | null;
  cliente_id?: string | null;
  numero_medidor?: string | null;
  marca_medidor?: string | null;
  modelo_medidor?: string | null;
  detalle_presupuesto?: string | null;
  modalidad_financiamiento?: string | null;
};

type Props = {
  id: string;
  initial: EditableFields;
};

export function SolicitudEditForm({ id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<EditableFields>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const cleaned: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === undefined) continue;
        cleaned[k] = v;
      }
      const res = await fetch(`/api/admin/solicitudes/${id}/patch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Error ${res.status}`);
      }
      setSuccess(true);
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
        <h3 className="text-lg font-semibold">Contacto del requirente</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={form.requirente_telefono ?? ""}
              onChange={(e) => update("requirente_telefono", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={form.requirente_direccion ?? ""}
              onChange={(e) => update("requirente_direccion", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h3 className="text-lg font-semibold">Propietario</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={form.propietario_telefono ?? ""}
              onChange={(e) => update("propietario_telefono", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={form.propietario_direccion ?? ""}
              onChange={(e) => update("propietario_direccion", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h3 className="text-lg font-semibold">Visita técnica y cliente</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha visita terreno</label>
            <input
              type="date"
              className="input"
              value={form.fecha_visita_terreno ?? ""}
              onChange={(e) => update("fecha_visita_terreno", e.target.value)}
            />
          </div>
          <div>
            <label className="label">N° de Cliente (boleta)</label>
            <input
              className="input"
              value={form.cliente_id ?? ""}
              onChange={(e) => update("cliente_id", e.target.value)}
            />
          </div>
          <div>
            <label className="label">N° medidor</label>
            <input
              className="input"
              value={form.numero_medidor ?? ""}
              onChange={(e) => update("numero_medidor", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Marca medidor</label>
            <input
              className="input"
              value={form.marca_medidor ?? ""}
              onChange={(e) => update("marca_medidor", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Modelo medidor</label>
            <input
              className="input"
              value={form.modelo_medidor ?? ""}
              onChange={(e) => update("modelo_medidor", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Modalidad financiamiento</label>
            <input
              className="input"
              value={form.modalidad_financiamiento ?? ""}
              onChange={(e) => update("modalidad_financiamiento", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Detalle de presupuesto</label>
            <textarea
              className="input"
              rows={3}
              value={form.detalle_presupuesto ?? ""}
              onChange={(e) => update("detalle_presupuesto", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Observaciones visita</label>
            <textarea
              className="input"
              rows={2}
              value={form.observaciones_visita ?? ""}
              onChange={(e) => update("observaciones_visita", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Observaciones generales</label>
            <textarea
              className="input"
              rows={2}
              value={form.observaciones ?? ""}
              onChange={(e) => update("observaciones", e.target.value)}
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Cambios guardados.
        </div>
      )}
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

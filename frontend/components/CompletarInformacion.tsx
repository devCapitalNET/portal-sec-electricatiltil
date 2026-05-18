"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiUrl } from "@/lib/assets";

import { FileUpload } from "./FileUpload";

export function CompletarInformacion({
  numSolicitud,
  motivo,
}: {
  numSolicitud: string;
  motivo: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    requirente_rut: "",
    requirente_telefono: "",
    requirente_direccion: "",
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [rutValido, setRutValido] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { requirente_rut: form.requirente_rut };
      if (form.requirente_telefono) payload.requirente_telefono = form.requirente_telefono;
      if (form.requirente_direccion) payload.requirente_direccion = form.requirente_direccion;
      if (form.mensaje) payload.mensaje = form.mensaje;

      const res = await fetch(apiUrl(`/api/public/seguimiento/update?num=${encodeURIComponent(numSolicitud)}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || body?.error || `Error ${res.status}`);
      }
      setSubmitted(true);
      setRutValido(form.requirente_rut);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-[#efa829] bg-amber-50 p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Completar información solicitada</h3>
        {motivo && (
          <p className="text-sm text-gray-800 mt-2 whitespace-pre-line bg-white border border-amber-200 rounded p-3">
            <strong>Motivo:</strong> {motivo}
          </p>
        )}
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Información enviada. La solicitud volvió al estado <strong>En análisis</strong>.
          </div>
          {rutValido && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Adjuntar documentos adicionales</h4>
              <FileUpload
                upload={{ mode: "publico", numSolicitud, rut: rutValido }}
              />
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-gray-700">
            Verifica tu identidad ingresando el RUT del requirente:
          </p>
          <div>
            <label className="label">RUT del requirente</label>
            <input
              className="input"
              required
              placeholder="12.345.678-9"
              value={form.requirente_rut}
              onChange={(e) => setForm({ ...form, requirente_rut: e.target.value })}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="label">Teléfono actualizado (opcional)</label>
              <input
                className="input"
                value={form.requirente_telefono}
                onChange={(e) => setForm({ ...form, requirente_telefono: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Dirección actualizada (opcional)</label>
              <input
                className="input"
                value={form.requirente_direccion}
                onChange={(e) => setForm({ ...form, requirente_direccion: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Mensaje al equipo (opcional)</label>
            <textarea
              className="input"
              rows={3}
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              placeholder="Describe brevemente la información que estás completando."
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Enviando…" : "Enviar información"}
          </button>
        </form>
      )}
    </div>
  );
}

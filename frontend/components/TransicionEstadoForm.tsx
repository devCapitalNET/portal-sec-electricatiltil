"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiUrl } from "@/lib/assets";
import { ESTADO_ACTUAL } from "@/lib/enums";

export function TransicionEstadoForm({ id, estadoActual }: { id: string; estadoActual: number }) {
  const router = useRouter();
  const [nuevo, setNuevo] = useState<number>(estadoActual);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (nuevo === estadoActual) {
          setError("Selecciona un estado distinto al actual");
          return;
        }
        setLoading(true);
        setError(null);
        const res = await fetch(apiUrl(`/api/admin/solicitudes/${id}/transicion`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevo_estado: nuevo, motivo: motivo || null }),
        });
        setLoading(false);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.error ?? `Error ${res.status}`);
          return;
        }
        router.refresh();
      }}
      className="space-y-3"
    >
      <div>
        <label className="label">Nuevo estado</label>
        <select className="input" value={nuevo} onChange={(e) => setNuevo(Number(e.target.value))}>
          {Object.entries(ESTADO_ACTUAL).map(([id, label]) => (
            <option key={id} value={id}>
              {id}. {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Motivo</label>
        <textarea className="input" rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Actualizando…" : "Transicionar"}
      </button>
    </form>
  );
}

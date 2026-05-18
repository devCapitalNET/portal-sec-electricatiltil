"use client";

import { useState } from "react";

export default function ExportPage() {
  const [tipo, setTipo] = useState<"factibilidad" | "conexion">("factibilidad");
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);
  const [desde, setDesde] = useState(firstOfMonth);
  const [hasta, setHasta] = useState(todayStr);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setError(null);
    setDownloading(true);
    try {
      const params = new URLSearchParams({ tipo });
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
      const res = await fetch(`/api/admin/export?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cd = res.headers.get("content-disposition") || "";
      const match = cd.match(/filename="?([^";]+)"?/);
      a.href = url;
      a.download = match?.[1] ?? `export_${tipo}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Export SEC</h1>
        <p className="text-sm text-gray-600 mt-2">
          Genera el archivo Excel mensual para la SEC, conforme al Anexo 1 NTCSSD.
        </p>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Tipo de trámite</label>
          <select
            className="input"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "factibilidad" | "conexion")}
          >
            <option value="factibilidad">Factibilidad</option>
            <option value="conexion">Conexión / Ampliación</option>
          </select>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>
        )}
        <button type="button" onClick={download} disabled={downloading} className="btn-primary w-full">
          {downloading ? "Generando…" : "Descargar Excel"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/assets";
import { TIPO_DOCUMENTO } from "@/lib/enums";

import { Spinner } from "./Spinner";

type Documento = {
  id: string;
  solicitud_id: string;
  tipo: string;
  nombre_original: string;
  content_type: string;
  size_bytes: number;
  subido_por: string;
  created_at: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function iconFor(tipo: string): string {
  if (tipo === "presupuesto") return "💰";
  if (tipo === "certificado_factibilidad") return "📜";
  if (tipo === "te1") return "📋";
  if (tipo === "plano") return "📐";
  if (tipo === "estudio_tecnico") return "🔧";
  if (tipo === "antecedente_cliente") return "📎";
  return "📄";
}

type Mode =
  | { mode: "admin"; solicitudId: string }
  | { mode: "publico"; numSolicitud: string };

export function DocumentList({ mode, refreshKey }: { mode: Mode; refreshKey?: number }) {
  const [docs, setDocs] = useState<Documento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setError(null);
    setDocs(null);
    try {
      const url =
        mode.mode === "admin"
          ? apiUrl(`/api/admin/documentos/list?solicitud_id=${encodeURIComponent(mode.solicitudId)}`)
          : apiUrl(`/api/public/documentos/list?num=${encodeURIComponent(mode.numSolicitud)}`);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDocs(await res.json());
    } catch (e) {
      setError((e as Error).message);
      setDocs([]);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    refreshKey,
    mode.mode,
    mode.mode === "admin" ? mode.solicitudId : null,
    mode.mode === "publico" ? mode.numSolicitud : null,
  ]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este documento?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(apiUrl(`/api/admin/documentos/delete?id=${encodeURIComponent(id)}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  if (docs === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Spinner size="sm" /> Cargando documentos…
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">Error: {error}</div>;
  }

  if (docs.length === 0) {
    return <div className="text-sm text-gray-500 italic">Sin documentos.</div>;
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {docs.map((d) => {
        const href =
          mode.mode === "admin"
            ? apiUrl(`/api/admin/documentos/download?id=${encodeURIComponent(d.id)}`)
            : apiUrl(`/api/public/documentos/download?id=${encodeURIComponent(d.id)}&num=${encodeURIComponent(mode.numSolicitud)}`);
        return (
          <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base" aria-hidden>
                  {iconFor(d.tipo)}
                </span>
                <span className="font-medium text-gray-900 truncate">{d.nombre_original}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {TIPO_DOCUMENTO[d.tipo] ?? d.tipo} · {formatSize(d.size_bytes)} · subido por {d.subido_por}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={href}
                className="text-xs font-medium text-[#efa829] hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Descargar
              </a>
              {mode.mode === "admin" && (
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  disabled={deletingId === d.id}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  {deletingId === d.id ? "…" : "Eliminar"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

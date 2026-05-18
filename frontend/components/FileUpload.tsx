"use client";

import { useRef, useState } from "react";

import { apiUrl } from "@/lib/assets";
import { TIPO_DOCUMENTO, TIPOS_DOCUMENTO_ADMIN, TIPOS_DOCUMENTO_CLIENTE } from "@/lib/enums";

import { Spinner } from "./Spinner";

type UploadMode =
  | { mode: "admin"; solicitudId: string }
  | { mode: "publico"; numSolicitud: string; rut: string };

type Props = {
  upload: UploadMode;
  onUploaded?: () => void;
  maxMB?: number;
};

const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-excel",
  "application/zip",
  "text/plain",
];

export function FileUpload({ upload, onUploaded, maxMB = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState<string>(
    upload.mode === "admin" ? TIPOS_DOCUMENTO_ADMIN[0] : TIPOS_DOCUMENTO_CLIENTE[0],
  );
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tiposPermitidos = upload.mode === "admin" ? TIPOS_DOCUMENTO_ADMIN : TIPOS_DOCUMENTO_CLIENTE;

  async function uploadFile(file: File) {
    setError(null);
    setSuccess(null);
    if (file.size > maxMB * 1024 * 1024) {
      setError(`Archivo excede el tamaño máximo (${maxMB} MB)`);
      return;
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      setError(`Tipo de archivo no permitido (${file.type || "desconocido"})`);
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("tipo", tipo);
      let url: string;
      if (upload.mode === "admin") {
        url = apiUrl(`/api/admin/documentos/upload?solicitud_id=${encodeURIComponent(upload.solicitudId)}`);
      } else {
        form.append("rut", upload.rut);
        url = apiUrl(`/api/public/documentos/upload?num=${encodeURIComponent(upload.numSolicitud)}`);
      }
      const res = await fetch(url, { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || body?.error || `Error ${res.status}`);
      }
      setSuccess(`Subido: ${file.name}`);
      onUploaded?.();
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Tipo de documento</label>
        <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {tiposPermitidos.map((t) => (
            <option key={t} value={t}>
              {TIPO_DOCUMENTO[t] ?? t}
            </option>
          ))}
        </select>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void uploadFile(f);
        }}
        className={`rounded-lg border-2 border-dashed transition-all p-6 text-center cursor-pointer ${
          drag ? "border-[#efa829] bg-amber-50" : "border-gray-300 bg-white hover:border-[#efa829]"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadFile(f);
          }}
        />
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Spinner size="md" /> Subiendo…
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800">Arrastra un archivo o haz clic para seleccionar</p>
            <p className="text-xs text-gray-500 mt-1">PDF, imágenes, Word, Excel · Máx {maxMB} MB</p>
          </div>
        )}
      </div>
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>
      )}
    </div>
  );
}

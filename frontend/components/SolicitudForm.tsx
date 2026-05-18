"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { apiUrl } from "@/lib/assets";
import {
  DATUM,
  DEFINITIVO_PROVISORIO,
  TIPO_CONSUMO,
  TIPO_FASE,
  TIPO_INSTALACION,
  TIPO_SOLICITUD,
  TIPO_TENSION,
  TIPO_ZONA_UTM,
  UBICACION_EMPALME,
} from "@/lib/enums";
import { solicitudPublicaSchema, type SolicitudPublicaForm } from "@/lib/schemas";

type Props = { tipoTramite: "factibilidad" | "conexion"; mode?: "publico" | "admin" };

const EMPTY: Partial<SolicitudPublicaForm> = {
  tipo_solicitud: 1,
  tipo_tension: 1,
  tipo_fase: 1,
  datum_id: 3,
  tipo_zona_utm: 19,
};

function Select({
  label,
  options,
  ...rest
}: { label: string; options: Record<number, string> } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" {...rest}>
        <option value="">— Seleccionar —</option>
        {Object.entries(options).map(([id, name]) => (
          <option key={id} value={id}>
            {id}. {name}
          </option>
        ))}
      </select>
    </div>
  );
}

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
const MAX_MB = 20;

export function SolicitudForm({ tipoTramite, mode = "publico" }: Props) {
  const isAdmin = mode === "admin";
  const [resultado, setResultado] = useState<{ num_solicitud: string; id: string; uploadErrors: string[] } | null>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [archivosError, setArchivosError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SolicitudPublicaForm>({
    resolver: zodResolver(solicitudPublicaSchema),
    defaultValues: { ...EMPTY, tipo_tramite: tipoTramite } as SolicitudPublicaForm,
  });

  const mutation = useMutation({
    mutationFn: async (data: SolicitudPublicaForm) => {
      const endpoint = isAdmin
        ? apiUrl("/api/admin/solicitudes")
        : apiUrl(`/api/public/solicitudes/${tipoTramite}`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Error ${res.status}`);
      }
      const creada = (await res.json()) as { num_solicitud: string; id: string };

      const uploadErrors: string[] = [];
      if (!isAdmin && archivos.length > 0) {
        await Promise.all(
          archivos.map(async (file) => {
            const form = new FormData();
            form.append("file", file);
            form.append("tipo", "antecedente_cliente");
            form.append("rut", data.requirente_rut);
            const up = await fetch(
              apiUrl(`/api/public/documentos/upload?num=${encodeURIComponent(creada.num_solicitud)}`),
              { method: "POST", body: form },
            );
            if (!up.ok) {
              const body = await up.json().catch(() => null);
              uploadErrors.push(`${file.name}: ${body?.detail || body?.error || up.status}`);
            }
          }),
        );
      }
      return { ...creada, uploadErrors };
    },
    onSuccess: (res) => setResultado(res),
  });

  const onSubmit: SubmitHandler<SolicitudPublicaForm> = (data) => mutation.mutate(data);
  const tipoSol = watch("tipo_solicitud");

  if (resultado) {
    return (
      <div className="card space-y-4">
        <h2 className="text-xl font-semibold text-green-700">Solicitud ingresada</h2>
        <p className="text-sm text-gray-600">Guarda tu número de solicitud para hacer seguimiento.</p>
        <div className="bg-amber-50 rounded p-4 font-mono text-lg border border-amber-200">
          {resultado.num_solicitud}
        </div>

        {resultado.uploadErrors.length > 0 && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            <p className="font-semibold mb-1">Algunos archivos no se pudieron subir:</p>
            <ul className="list-disc list-inside">
              {resultado.uploadErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <p className="mt-2">Puedes volver a intentarlo desde la pagina de seguimiento.</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href={isAdmin ? `/admin/solicitudes` : `/seguimiento/${resultado.num_solicitud}`}
            className="btn-primary"
          >
            {isAdmin ? "Volver al listado" : "Ver seguimiento"}
          </Link>
          {!isAdmin && (
            <Link href="/" className="btn-secondary">
              Volver al inicio
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("tipo_tramite")} />

      <section className="card space-y-4">
        <h3 className="font-semibold text-slate-900">1. Tipo de solicitud</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Select label="Tipo de solicitud" options={TIPO_SOLICITUD} {...register("tipo_solicitud")} />
          <Select label="Tipo de consumo" options={TIPO_CONSUMO} {...register("tipo_consumo_id")} />
          <Select
            label="Definitivo / Provisorio"
            options={DEFINITIVO_PROVISORIO}
            {...register("definitivo_provisorio")}
          />
        </div>
      </section>

      <section className="card space-y-4">
        <h3 className="font-semibold text-slate-900">2. Datos del Requirente</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">RUT/RUN *</label>
            <input className="input" placeholder="12.345.678-9" {...register("requirente_rut")} />
            {errors.requirente_rut && <p className="text-xs text-red-600 mt-1">{errors.requirente_rut.message}</p>}
          </div>
          <div>
            <label className="label">Nombre completo / Razón social *</label>
            <input className="input" {...register("requirente_nombre")} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Dirección *</label>
            <input className="input" {...register("requirente_direccion")} />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" {...register("requirente_telefono")} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" {...register("requirente_email")} />
            {errors.requirente_email && <p className="text-xs text-red-600 mt-1">{errors.requirente_email.message}</p>}
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h3 className="font-semibold text-slate-900">3. Datos del Propietario del inmueble</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">RUT/RUN *</label>
            <input className="input" {...register("propietario_rut")} />
          </div>
          <div>
            <label className="label">Nombre / Razón social *</label>
            <input className="input" {...register("propietario_nombre")} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Dirección</label>
            <input className="input" {...register("propietario_direccion")} />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" {...register("propietario_telefono")} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" {...register("propietario_email")} />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="autorizacion" {...register("autorizacion_tercero")} />
            <label htmlFor="autorizacion" className="text-sm text-slate-700">
              Cuenta con autorización notarial o mandato de tercero
            </label>
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <h3 className="font-semibold text-slate-900">4. Datos técnicos</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Select label="Tipo de tensión *" options={TIPO_TENSION} {...register("tipo_tension")} />
          <div>
            <label className="label">Potencia solicitada (kW) *</label>
            <input className="input" type="number" step="0.01" {...register("potencia_solicitada")} />
            {errors.potencia_solicitada && (
              <p className="text-xs text-red-600 mt-1">{errors.potencia_solicitada.message}</p>
            )}
          </div>
          <Select label="Tipo de fase *" options={TIPO_FASE} {...register("tipo_fase")} />
          <div>
            <label className="label">ID Concesión *</label>
            <input className="input" maxLength={10} {...register("concesion_id")} />
          </div>
          <Select label="Tipo de instalación *" options={TIPO_INSTALACION} {...register("tipo_instalacion_id")} />
          <div>
            <label className="label">Identificador conexión *</label>
            <input className="input" placeholder="RT-POSTE-112" {...register("identificador_conexion")} />
          </div>
          <Select label="Ubicación empalme *" options={UBICACION_EMPALME} {...register("ubicacion_empalme")} />
          {tipoTramite === "conexion" && tipoSol === 2 && (
            <div>
              <label className="label">Número de Cliente (boleta)</label>
              <input className="input" {...register("cliente_id")} />
            </div>
          )}
        </div>
      </section>

      <section className="card space-y-4">
        <h3 className="font-semibold text-slate-900">5. Ubicación de la instalación</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Dirección de instalación *</label>
            <input className="input" {...register("direccion_instalacion")} />
          </div>
          <Select label="Datum *" options={DATUM} {...register("datum_id")} />
          <Select label="Zona UTM *" options={TIPO_ZONA_UTM} {...register("tipo_zona_utm")} />
          <div>
            <label className="label">Coordenada X (UTM) *</label>
            <input className="input" placeholder="349582.35214567" {...register("coord_x")} />
          </div>
          <div>
            <label className="label">Coordenada Y (UTM) *</label>
            <input className="input" placeholder="6295785.12345678" {...register("coord_y")} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Observaciones</label>
            <textarea className="input" rows={2} {...register("observaciones")} />
          </div>
        </div>
      </section>

      {!isAdmin && (
        <section className="card space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900">6. Adjuntar antecedentes (opcional)</h3>
            <p className="text-sm text-gray-600 mt-1">
              PDF, imágenes, planos o documentos relacionados. Máximo {MAX_MB} MB por archivo.
            </p>
          </div>
          <input
            type="file"
            multiple
            accept={ALLOWED_MIME.join(",")}
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? []);
              const invalidSize = selected.find((f) => f.size > MAX_MB * 1024 * 1024);
              if (invalidSize) {
                setArchivosError(`"${invalidSize.name}" excede ${MAX_MB} MB`);
                e.target.value = "";
                return;
              }
              const invalidMime = selected.find((f) => f.type && !ALLOWED_MIME.includes(f.type));
              if (invalidMime) {
                setArchivosError(`Tipo de archivo no permitido: ${invalidMime.type}`);
                e.target.value = "";
                return;
              }
              setArchivosError(null);
              setArchivos(selected);
            }}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-[#efa829] hover:file:bg-amber-100"
          />
          {archivosError && <p className="text-xs text-red-600">{archivosError}</p>}
          {archivos.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-1">
              {archivos.map((f, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="truncate">📎 {f.name}</span>
                  <span className="text-gray-400 shrink-0">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
          Error al enviar: {(mutation.error as Error).message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Link href="/" className="btn-secondary">
          Cancelar
        </Link>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
    </form>
  );
}

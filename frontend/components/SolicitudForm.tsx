"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { api } from "@/lib/api";
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

import { FileUpload } from "./FileUpload";

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

export function SolicitudForm({ tipoTramite, mode = "publico" }: Props) {
  const isAdmin = mode === "admin";
  const [resultado, setResultado] = useState<{ num_solicitud: string; id: string; rut: string } | null>(null);
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
      if (isAdmin) {
        const res = await fetch("/api/admin/solicitudes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `Error ${res.status}`);
        }
        return (await res.json()) as { num_solicitud: string; id: string };
      }
      return api<{ num_solicitud: string; id: string }>(`/public/solicitudes/${tipoTramite}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (res, vars) => setResultado({ ...res, rut: vars.requirente_rut }),
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

        {!isAdmin && (
          <div>
            <h3 className="text-base font-semibold mt-2 mb-2">Adjuntar antecedentes (opcional)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Puedes adjuntar archivos PDF, imágenes, planos o documentos relacionados.
            </p>
            <FileUpload
              upload={{
                mode: "publico",
                numSolicitud: resultado.num_solicitud,
                rut: resultado.rut,
              }}
            />
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

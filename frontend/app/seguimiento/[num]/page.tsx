import Link from "next/link";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";
import { ESTADO_ACTUAL, ESTADO_COLOR, TIPO_SOLICITUD } from "@/lib/enums";

type Seguimiento = {
  num_solicitud: string;
  tipo_tramite: string;
  tipo_solicitud: number;
  estado_actual: number;
  fecha_ingreso: string;
  fecha_ultima_actualizacion: string;
  fecha_respuesta_empresa: string | null;
  requirente_nombre: string;
  direccion_instalacion: string;
  observaciones: string | null;
};

export default async function SeguimientoDetail({ params }: { params: Promise<{ num: string }> }) {
  const { num } = await params;
  let data: Seguimiento;
  try {
    data = await api<Seguimiento>(`/public/seguimiento/${num}`);
  } catch (e) {
    if ((e as Error).message.includes("404")) notFound();
    throw e;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/seguimiento" className="text-sm text-[#efa829] hover:underline font-medium">
          ← Otra consulta
        </Link>
      </div>
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Número de solicitud</div>
            <div className="font-mono text-lg font-semibold">{data.num_solicitud}</div>
          </div>
          <span className={ESTADO_COLOR[data.estado_actual] || "badge-gray"}>
            {ESTADO_ACTUAL[data.estado_actual]}
          </span>
        </div>

        <hr />

        <dl className="grid grid-cols-2 gap-4 text-base">
          <div>
            <dt className="text-slate-500">Trámite</dt>
            <dd className="font-medium capitalize">{data.tipo_tramite}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Tipo</dt>
            <dd className="font-medium">{TIPO_SOLICITUD[data.tipo_solicitud]}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Fecha de ingreso</dt>
            <dd className="font-medium">{data.fecha_ingreso}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Última actualización</dt>
            <dd className="font-medium">{data.fecha_ultima_actualizacion}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Respuesta de la empresa</dt>
            <dd className="font-medium">{data.fecha_respuesta_empresa || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Requirente</dt>
            <dd className="font-medium">{data.requirente_nombre}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-500">Dirección instalación</dt>
            <dd className="font-medium">{data.direccion_instalacion}</dd>
          </div>
          {data.observaciones && (
            <div className="col-span-2">
              <dt className="text-slate-500">Observaciones</dt>
              <dd className="font-medium">{data.observaciones}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

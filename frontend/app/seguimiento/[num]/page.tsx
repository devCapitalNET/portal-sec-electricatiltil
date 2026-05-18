import Link from "next/link";
import { notFound } from "next/navigation";

import { CompletarInformacion } from "@/components/CompletarInformacion";
import { DocumentList } from "@/components/DocumentList";
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
  causa_rechazo_notificacion: string | null;
  estudios_tecnicos_requeridos: string | null;
  respuesta_factibilidad: boolean | null;
  motivo_pendiente: string | null;
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

  const isPendiente = data.estado_actual === 2;
  const isInadmisible = data.estado_actual === 3;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/seguimiento" className="text-sm text-[#efa829] hover:underline font-medium">
          ← Otra consulta
        </Link>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-gray-500">Número de solicitud</div>
            <div className="font-mono text-lg font-semibold">{data.num_solicitud}</div>
          </div>
          <span className={ESTADO_COLOR[data.estado_actual] || "badge-gray"}>
            {ESTADO_ACTUAL[data.estado_actual]}
          </span>
        </div>

        <hr />

        <dl className="grid grid-cols-2 gap-4 text-base">
          <div>
            <dt className="text-gray-500 text-sm">Trámite</dt>
            <dd className="font-medium capitalize">{data.tipo_tramite}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Tipo</dt>
            <dd className="font-medium">{TIPO_SOLICITUD[data.tipo_solicitud]}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Fecha de ingreso</dt>
            <dd className="font-medium">{data.fecha_ingreso}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Última actualización</dt>
            <dd className="font-medium">{data.fecha_ultima_actualizacion}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Respuesta de la empresa</dt>
            <dd className="font-medium">{data.fecha_respuesta_empresa || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Requirente</dt>
            <dd className="font-medium">{data.requirente_nombre}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-500 text-sm">Dirección instalación</dt>
            <dd className="font-medium">{data.direccion_instalacion}</dd>
          </div>
          {data.observaciones && (
            <div className="col-span-2">
              <dt className="text-gray-500 text-sm">Observaciones</dt>
              <dd className="font-medium">{data.observaciones}</dd>
            </div>
          )}
        </dl>
      </div>

      {isInadmisible && (data.causa_rechazo_notificacion || data.estudios_tecnicos_requeridos) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 space-y-3">
          <h3 className="font-semibold text-red-800">Solicitud inadmisible</h3>
          {data.causa_rechazo_notificacion && (
            <div>
              <div className="text-xs text-red-700 uppercase font-semibold">Causa</div>
              <p className="text-sm text-red-900">{data.causa_rechazo_notificacion}</p>
            </div>
          )}
          {data.estudios_tecnicos_requeridos && (
            <div>
              <div className="text-xs text-red-700 uppercase font-semibold">Estudios técnicos requeridos</div>
              <p className="text-sm text-red-900 whitespace-pre-line">{data.estudios_tecnicos_requeridos}</p>
            </div>
          )}
        </div>
      )}

      {isPendiente && (
        <CompletarInformacion numSolicitud={data.num_solicitud} motivo={data.motivo_pendiente} />
      )}

      <div className="card space-y-4">
        <h3 className="font-semibold">Documentos disponibles</h3>
        <DocumentList mode={{ mode: "publico", numSolicitud: data.num_solicitud }} />
      </div>
    </div>
  );
}

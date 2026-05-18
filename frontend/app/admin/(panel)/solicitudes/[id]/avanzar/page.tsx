import Link from "next/link";

import { AdvanceForm } from "@/components/AdvanceForm";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { ESTADO_ACTUAL, ESTADO_COLOR } from "@/lib/enums";

type Solicitud = {
  id: string;
  num_solicitud: string;
  tipo_tramite: string;
  estado_actual: number;
  presupuesto: number | null;
  estudios_tecnicos_requeridos: string | null;
};

export default async function AvanzarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();
  const s = await api<Solicitud>(`/admin/solicitudes/${id}`, { token });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href={`/admin/solicitudes/${id}`}
          className="text-sm text-[#efa829] hover:underline font-medium"
        >
          ← Volver al detalle
        </Link>
        <h1 className="text-2xl font-bold mt-1">
          Avanzar solicitud <span className="font-mono">{s.num_solicitud}</span>
        </h1>
        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
          Estado actual:{" "}
          <span className={ESTADO_COLOR[s.estado_actual] || "badge-gray"}>
            {ESTADO_ACTUAL[s.estado_actual]}
          </span>
        </div>
      </div>

      <AdvanceForm
        id={s.id}
        numSolicitud={s.num_solicitud}
        tipoTramite={s.tipo_tramite}
        estadoActual={s.estado_actual}
        presupuestoActual={s.presupuesto}
        estudiosActual={s.estudios_tecnicos_requeridos}
      />
    </div>
  );
}

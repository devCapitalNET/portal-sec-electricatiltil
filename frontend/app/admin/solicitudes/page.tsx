import Link from "next/link";

import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { ESTADO_ACTUAL, ESTADO_COLOR, TIPO_SOLICITUD } from "@/lib/enums";

type Item = {
  id: string;
  num_solicitud: string;
  tipo_tramite: string;
  tipo_solicitud: number;
  estado_actual: number;
  fecha_ingreso: string;
  fecha_ultima_actualizacion: string;
  fecha_respuesta_empresa: string | null;
  requirente_rut: string;
  requirente_nombre: string;
  direccion_instalacion: string;
  potencia_solicitada: number;
};

type Resp = { items: Item[]; total: number; page: number; page_size: number };

export default async function SolicitudesList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const token = await getAuthToken();
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) qs.set(k, v);
  if (!qs.get("page")) qs.set("page", "1");
  if (!qs.get("page_size")) qs.set("page_size", "20");

  const data = await api<Resp>(`/admin/solicitudes?${qs}`, { token });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Solicitudes</h1>
        <Link href="/admin/solicitudes/nueva" className="btn-primary">
          + Nueva
        </Link>
      </div>

      <form className="card grid md:grid-cols-5 gap-3 text-sm">
        <select className="input" name="tipo_tramite" defaultValue={sp.tipo_tramite || ""}>
          <option value="">Tipo trámite (todos)</option>
          <option value="factibilidad">Factibilidad</option>
          <option value="conexion">Conexión / Ampliación</option>
        </select>
        <select className="input" name="estado_actual" defaultValue={sp.estado_actual || ""}>
          <option value="">Estado (todos)</option>
          {Object.entries(ESTADO_ACTUAL).map(([id, label]) => (
            <option key={id} value={id}>
              {id}. {label}
            </option>
          ))}
        </select>
        <input className="input" name="rut" placeholder="RUT" defaultValue={sp.rut || ""} />
        <input
          className="input"
          name="num_solicitud"
          placeholder="N° solicitud"
          defaultValue={sp.num_solicitud || ""}
        />
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left p-3">N°</th>
              <th className="text-left p-3">Trámite</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Requirente</th>
              <th className="text-left p-3">Dirección</th>
              <th className="text-left p-3">Ingreso</th>
              <th className="text-left p-3">Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.items.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-mono">{s.num_solicitud}</td>
                <td className="p-3 capitalize">{s.tipo_tramite}</td>
                <td className="p-3">{TIPO_SOLICITUD[s.tipo_solicitud]}</td>
                <td className="p-3">
                  <div>{s.requirente_nombre}</div>
                  <div className="text-xs text-slate-500">{s.requirente_rut}</div>
                </td>
                <td className="p-3 text-xs">{s.direccion_instalacion}</td>
                <td className="p-3">{s.fecha_ingreso}</td>
                <td className="p-3">
                  <span className={ESTADO_COLOR[s.estado_actual] || "badge-gray"}>
                    {ESTADO_ACTUAL[s.estado_actual]}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/solicitudes/${s.id}`} className="text-brand hover:underline text-xs">
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        Total: {data.total} · Página {data.page}
      </div>
    </div>
  );
}

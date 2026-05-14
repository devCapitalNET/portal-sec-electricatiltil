import Link from "next/link";

import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { ESTADO_ACTUAL, ESTADO_COLOR } from "@/lib/enums";

type Dashboard = {
  por_estado: Record<string, number>;
  por_tipo: Record<string, number>;
  total: number;
};

export default async function AdminDashboard() {
  const token = await getAuthToken();
  const data = await api<Dashboard>("/admin/dashboard", { token });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs text-slate-500 uppercase">Solicitudes totales</div>
          <div className="text-3xl font-bold mt-1">{data.total}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500 uppercase">Factibilidad</div>
          <div className="text-3xl font-bold mt-1">{data.por_tipo["factibilidad"] || 0}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500 uppercase">Conexión / Ampliación</div>
          <div className="text-3xl font-bold mt-1">{data.por_tipo["conexion"] || 0}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Distribución por estado</h2>
        <div className="space-y-2">
          {Object.entries(ESTADO_ACTUAL).map(([id, label]) => {
            const count = data.por_estado[id] || 0;
            return (
              <Link
                key={id}
                href={`/admin/solicitudes?estado_actual=${id}`}
                className="flex items-center justify-between py-2 px-3 rounded hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span className={ESTADO_COLOR[Number(id)] || "badge-gray"}>{id}</span>
                  <span className="text-sm">{label}</span>
                </span>
                <span className="font-semibold">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

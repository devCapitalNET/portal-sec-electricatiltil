"use client";

import Link from "next/link";
import { useState } from "react";

import { SolicitudForm } from "@/components/SolicitudForm";

export default function NuevaSolicitudPage() {
  const [tipo, setTipo] = useState<"factibilidad" | "conexion" | null>(null);

  if (!tipo) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <Link href="/admin/solicitudes" className="text-sm text-[#efa829] hover:underline font-medium">
            ← Volver al listado
          </Link>
          <h1 className="text-2xl font-bold mt-1">Nueva solicitud</h1>
          <p className="text-sm text-gray-600 mt-2">
            Crea una solicitud manualmente en representación del cliente. Selecciona el tipo de trámite:
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTipo("factibilidad")}
            className="card text-left hover:border-[#efa829] hover:shadow-md transition-all cursor-pointer"
          >
            <h2 className="text-lg font-semibold">Factibilidad técnica</h2>
            <p className="text-sm text-gray-600 mt-2">
              Solicitud previa de evaluación técnica conforme al Art. 5-1 y 5-2 NTCSSD.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setTipo("conexion")}
            className="card text-left hover:border-[#efa829] hover:shadow-md transition-all cursor-pointer"
          >
            <h2 className="text-lg font-semibold">Conexión / Ampliación</h2>
            <p className="text-sm text-gray-600 mt-2">
              Conexión nueva o ampliación de servicio existente conforme al Art. 5-4 y 5-5 NTCSSD.
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => setTipo(null)}
          className="text-sm text-[#efa829] hover:underline font-medium"
        >
          ← Cambiar tipo
        </button>
        <h1 className="text-2xl font-bold mt-1 capitalize">Nueva solicitud — {tipo}</h1>
      </div>
      <SolicitudForm tipoTramite={tipo} mode="admin" />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SeguimientoIndex() {
  const router = useRouter();
  const [num, setNum] = useState("");

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Seguimiento de solicitud</h1>
        <p className="text-base text-gray-500 mt-2">
          Ingresa el número de solicitud entregado al momento del registro para consultar su estado actual.
        </p>
      </div>
      <div className="card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (num.trim()) router.push(`/seguimiento/${num.trim()}`);
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Número de solicitud</label>
            <input
              className="input font-mono"
              placeholder="2026-FT-00001"
              value={num}
              onChange={(e) => setNum(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Consultar estado
          </button>
        </form>
      </div>
    </div>
  );
}

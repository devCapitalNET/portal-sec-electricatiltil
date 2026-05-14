import Link from "next/link";

export default function NuevaSolicitudPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva solicitud (admin)</h1>
      <p className="text-sm text-slate-600">
        Para el POC, los formularios públicos también sirven para creación administrativa. Usa los formularios públicos
        y luego ajusta estados desde el detalle.
      </p>
      <div className="flex gap-3">
        <Link href="/solicitud/factibilidad" className="btn-primary">
          Crear solicitud de factibilidad
        </Link>
        <Link href="/solicitud/conexion" className="btn-primary">
          Crear solicitud de conexión
        </Link>
      </div>
    </div>
  );
}

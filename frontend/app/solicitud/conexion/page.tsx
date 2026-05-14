import { SolicitudForm } from "@/components/SolicitudForm";

export default function ConexionPage() {
  return (
    <div className="space-y-6">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-8 bg-gradient-to-r from-[#efa829]/15 via-amber-50 to-white px-4 py-8 sm:px-6 lg:px-8 border-b border-[#efa829]/20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Solicitud de Conexión / Ampliación</h1>
          <p className="text-base text-gray-600 mt-2">
            Conforme a los Artículos 5-4 y 5-5 de la NTCSSD. Si es una ampliación, debes informar el número de cliente asignado en tu boleta.
          </p>
        </div>
      </div>
      <SolicitudForm tipoTramite="conexion" />
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
      {/* Hero — fondo ámbar, sin fondos oscuros */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#efa829] via-[#f5b940] to-amber-300 px-4 py-24 sm:px-6 lg:px-8">
        {/* Decoraciones geométricas */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative max-w-3xl mx-auto text-center">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-gray-900/20 bg-white/30 px-4 py-1.5 text-sm font-medium text-gray-900 mb-6">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
            </svg>
            Portal de Solicitudes SEC — NTCSSD
          </span>
          <h1 className="animate-fade-in-up delay-100 text-4xl font-extrabold text-gray-900 sm:text-5xl mb-5 leading-tight">
            Solicitudes eléctricas<br />
            <span className="text-white drop-shadow-sm">online y sin trámites</span>
          </h1>
          <p className="animate-fade-in-up delay-200 text-xl text-gray-800 max-w-2xl mx-auto mb-10">
            Gestiona la factibilidad técnica o conexión de tu suministro eléctrico
            en línea, conforme a la normativa vigente de la SEC.
          </p>
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/solicitud/factibilidad"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:scale-[1.02]"
            >
              Iniciar solicitud
            </Link>
            <Link
              href="/seguimiento"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white/90 px-8 py-4 text-base font-semibold text-gray-900 transition-all duration-200 hover:bg-white hover:scale-[1.02]"
            >
              Seguir mi solicitud
            </Link>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-2">Trámites disponibles</p>
          <h2 className="text-3xl font-bold text-gray-900">¿Qué necesitas gestionar?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/solicitud/factibilidad" className="card hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3c7] mb-4 group-hover:bg-[#efa829]/30 transition-colors duration-200">
              <svg className="h-6 w-6 text-[#efa829]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Factibilidad Técnica</h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Consulta la viabilidad técnica para conectar un nuevo punto de suministro o ampliar uno existente. Conforme al Art. 5-1 y 5-2 NTCSSD.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-base font-medium text-[#efa829] group-hover:gap-2 transition-all duration-200">
              Iniciar <span>→</span>
            </span>
          </Link>

          <Link href="/solicitud/conexion" className="card hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3c7] mb-4 group-hover:bg-[#efa829]/30 transition-colors duration-200">
              <svg className="h-6 w-6 text-[#efa829]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Conexión / Ampliación</h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Solicita la conexión de un nuevo servicio eléctrico o la ampliación de potencia de un suministro existente. Conforme al Art. 5-3 NTCSSD.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-base font-medium text-[#efa829] group-hover:gap-2 transition-all duration-200">
              Iniciar <span>→</span>
            </span>
          </Link>

          <Link href="/seguimiento" className="card hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3c7] mb-4 group-hover:bg-[#efa829]/30 transition-colors duration-200">
              <svg className="h-6 w-6 text-[#efa829]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Seguimiento</h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Consulta el estado de tu solicitud en cualquier momento usando el número de seguimiento entregado al momento del registro.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-base font-medium text-[#efa829] group-hover:gap-2 transition-all duration-200">
              Consultar <span>→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Plazos info */}
      <section className="bg-gradient-to-r from-[#efa829]/10 via-amber-50 to-[#efa829]/5 px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-2">Plazos normativos</p>
            <h2 className="text-2xl font-bold text-gray-900">Compromisos conforme a la NTCSSD</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#efa829]/30 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-5xl font-extrabold text-[#efa829] mb-1">15</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">días hábiles</div>
              <div className="text-base text-gray-600">Respuesta de factibilidad técnica</div>
            </div>
            <div className="rounded-xl border border-[#efa829]/30 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-5xl font-extrabold text-[#efa829] mb-1">30</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">días hábiles</div>
              <div className="text-base text-gray-600">Ejecución de la conexión eléctrica</div>
            </div>
            <div className="rounded-xl border border-[#efa829]/30 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="text-5xl font-extrabold text-[#efa829] mb-1">100%</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">en línea</div>
              <div className="text-base text-gray-600">Trámite sin necesidad de ir a oficina</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { asset } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Portal de Solicitudes — Eléctrica TilTil",
  description:
    "Solicitudes de factibilidad, conexión y ampliación de servicios eléctricos — Empresa Eléctrica Municipal de TilTil",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <header className="sticky top-0 z-50 h-16 border-b border-gray-200 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center">
                <img
                  src={asset("/images/logo.svg")}
                  alt="Eléctrica TilTil — Empresa Municipal"
                  className="h-10 w-auto"
                />
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link href="/solicitud/factibilidad" className="hover:text-[#efa829] transition-colors duration-200">
                  Factibilidad
                </Link>
                <Link href="/solicitud/conexion" className="hover:text-[#efa829] transition-colors duration-200">
                  Conexión
                </Link>
                <Link href="/seguimiento" className="hover:text-[#efa829] transition-colors duration-200">
                  Seguimiento
                </Link>
                <Link href="/admin/login" className="btn-secondary text-xs px-4 py-2">
                  Acceso interno
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div>
                  <img
                    src={asset("/images/logo.svg")}
                    alt="Eléctrica TilTil"
                    className="h-8 w-auto mb-3"
                  />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Empresa Eléctrica Municipal de TilTil.<br />
                    Servicio de distribución eléctrica para la comuna de TilTil, Región Metropolitana.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Servicios</p>
                  <ul className="space-y-2 text-xs text-gray-500">
                    <li><Link href="/solicitud/factibilidad" className="hover:text-[#efa829] transition-colors">Solicitar factibilidad técnica</Link></li>
                    <li><Link href="/solicitud/conexion" className="hover:text-[#efa829] transition-colors">Solicitar conexión o ampliación</Link></li>
                    <li><Link href="/seguimiento" className="hover:text-[#efa829] transition-colors">Seguimiento de solicitudes</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Marco regulatorio</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Conforme al Oficio Circular SEC N°316998.<br />
                    Art. 5-1 a 5-5 de la Norma Técnica de Calidad de Servicio para Sistemas de Distribución (NTCSSD).
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
                © {new Date().getFullYear()} Empresa Eléctrica Municipal de TilTil
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import { asset } from "@/lib/assets";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="space-y-0.5 text-sm">
        <div className="mb-4">
          <img src={asset("/images/logo.svg")} alt="Eléctrica TilTil" className="h-7 w-auto" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2">Panel interno</p>
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-[#efa829] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <Link
          href="/admin/solicitudes"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-[#efa829] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Solicitudes
        </Link>
        <Link
          href="/admin/solicitudes/nueva"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-[#efa829] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva solicitud
        </Link>
        <Link
          href="/admin/usuarios"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-[#efa829] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Usuarios
        </Link>
        <Link
          href="/admin/export"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-[#efa829] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          Export SEC
        </Link>
        <div className="pt-2">
          <LogoutButton />
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}

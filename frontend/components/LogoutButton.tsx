"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="block w-full text-left px-3 py-2 rounded text-slate-600 hover:bg-slate-100 mt-4"
    >
      Cerrar sesión
    </button>
  );
}

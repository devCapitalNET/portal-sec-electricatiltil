import Link from "next/link";

import { UsuariosTable } from "@/components/UsuariosTable";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

type User = { id: string; email: string; nombre: string; rol: string; activo: boolean };

export default async function UsuariosPage() {
  const token = await getAuthToken();
  let users: User[] = [];
  let error: string | null = null;
  try {
    users = await api<User[]>("/admin/users", { token });
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Link href="/admin/usuarios/nuevo" className="btn-primary">
          + Nuevo usuario
        </Link>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Solo el rol admin puede ver esta sección. ({error})
        </div>
      )}
      {!error && <UsuariosTable initialUsers={users} />}
    </div>
  );
}

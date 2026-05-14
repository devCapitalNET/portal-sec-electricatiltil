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
      <h1 className="text-2xl font-bold">Usuarios</h1>
      {error && (
        <div className="text-red-600 text-sm">Solo el rol admin puede ver esta sección. ({error})</div>
      )}
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Activo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.nombre}</td>
                <td className="p-3">{u.rol}</td>
                <td className="p-3">{u.activo ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

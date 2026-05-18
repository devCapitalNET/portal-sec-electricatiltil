"use client";

import { useState } from "react";

type User = { id: string; email: string; nombre: string; rol: string; activo: boolean };

export function UsuariosTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ nombre: string; rol: string; activo: boolean; password: string }>({
    nombre: "",
    rol: "operador",
    activo: true,
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function startEdit(u: User) {
    setEditing(u.id);
    setError(null);
    setForm({ nombre: u.nombre, rol: u.rol, activo: u.activo, password: "" });
  }

  async function saveEdit(id: string) {
    setBusy(id);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        nombre: form.nombre,
        rol: form.rol,
        activo: form.activo,
      };
      if (form.password) payload.password = form.password;
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || body?.error || `Error ${res.status}`);
      }
      const updated = (await res.json()) as User;
      setUsers((list) => list.map((u) => (u.id === id ? updated : u)));
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function toggleActive(u: User) {
    setBusy(u.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !u.activo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || body?.error || `Error ${res.status}`);
      }
      const updated = (await res.json()) as User;
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Activo</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
              editing === u.id ? (
                <tr key={u.id} className="border-t border-gray-100 bg-amber-50/30">
                  <td className="p-3 text-xs text-gray-700">{u.email}</td>
                  <td className="p-3">
                    <input
                      className="input py-1 text-sm"
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    />
                  </td>
                  <td className="p-3">
                    <select
                      className="input py-1 text-sm"
                      value={form.rol}
                      onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
                    >
                      <option value="operador">operador</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <label className="text-sm inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.activo}
                        onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                      />
                      Activo
                    </label>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <input
                        type="password"
                        placeholder="Nueva contraseña (opcional)"
                        className="input py-1 text-xs w-44"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      />
                      <button
                        onClick={() => saveEdit(u.id)}
                        disabled={busy === u.id}
                        className="text-xs font-semibold text-[#efa829] hover:underline disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.nombre}</td>
                  <td className="p-3">{u.rol}</td>
                  <td className="p-3">
                    <span className={u.activo ? "badge-green" : "badge-gray"}>
                      {u.activo ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => startEdit(u)}
                        className="text-xs text-[#efa829] hover:underline font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={busy === u.id}
                        className={`text-xs hover:underline ${
                          u.activo ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {u.activo ? "Desactivar" : "Reactivar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Sin usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginForm } from "@/lib/schemas";
import { apiUrl, asset } from "@/lib/assets";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/admin";
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@tiltil.cl", password: "" },
  });

  return (
    <div className="max-w-sm mx-auto">
      <div className="mb-6 text-center">
        <img src={asset("/images/logo.svg")} alt="Eléctrica TilTil" className="h-9 w-auto mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Acceso interno</h1>
        <p className="text-sm text-gray-500 mt-1">Personal de Empresa Eléctrica Municipal de TilTil</p>
      </div>
      <div className="card">
        <form
          onSubmit={handleSubmit(async (data) => {
            setError(null);
            const res = await fetch(apiUrl("/api/admin/login"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (!res.ok) {
              setError("Credenciales inválidas. Verifica tu email y contraseña.");
              return;
            }
            router.push(redirect);
            router.refresh();
          })}
          className="space-y-4"
        >
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register("email")} />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" {...register("password")} />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <button type="submit" disabled={formState.isSubmitting} className="btn-primary w-full">
            {formState.isSubmitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

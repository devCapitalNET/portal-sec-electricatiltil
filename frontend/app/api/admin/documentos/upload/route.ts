import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const solicitudId = url.searchParams.get("solicitud_id");
  if (!solicitudId) return NextResponse.json({ error: "solicitud_id requerido" }, { status: 400 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await req.formData();
  const upstream = await fetch(`${apiBaseUrl}/admin/solicitudes/${solicitudId}/documentos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData as unknown as BodyInit,
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}

import { NextResponse } from "next/server";

import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const solicitudId = url.searchParams.get("solicitud_id");
  if (!solicitudId) return NextResponse.json({ error: "solicitud_id requerido" }, { status: 400 });
  const token = await getAuthToken();
  try {
    const data = await api(`/admin/solicitudes/${solicitudId}/documentos`, { token });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

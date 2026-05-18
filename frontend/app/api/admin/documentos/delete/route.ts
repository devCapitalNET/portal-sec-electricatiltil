import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const upstream = await fetch(`${apiBaseUrl}/admin/documentos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return new NextResponse(null, { status: upstream.status });
}

import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const upstream = await fetch(`${apiBaseUrl}/admin/documentos/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!upstream.ok) {
    return NextResponse.json({ error: `Error ${upstream.status}` }, { status: upstream.status });
  }
  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  const cd = upstream.headers.get("content-disposition");
  if (cd) headers.set("Content-Disposition", cd);
  return new NextResponse(upstream.body, { status: 200, headers });
}

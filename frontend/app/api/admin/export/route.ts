import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = new URLSearchParams();
  const tipo = url.searchParams.get("tipo");
  if (!tipo) return NextResponse.json({ error: "tipo requerido" }, { status: 400 });
  params.set("tipo", tipo);
  const desde = url.searchParams.get("desde");
  const hasta = url.searchParams.get("hasta");
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);

  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const upstream = await fetch(`${apiBaseUrl}/admin/export/sec.xlsx?${params.toString()}`, {
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

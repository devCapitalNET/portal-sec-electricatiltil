import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const num = url.searchParams.get("num");
  if (!id || !num) return NextResponse.json({ error: "id y num requeridos" }, { status: 400 });

  const upstream = await fetch(
    `${apiBaseUrl}/public/documentos/${id}/download?num_solicitud=${encodeURIComponent(num)}`,
  );
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

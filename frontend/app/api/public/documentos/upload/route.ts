import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/api";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const num = url.searchParams.get("num");
  if (!num) return NextResponse.json({ error: "num requerido" }, { status: 400 });

  const formData = await req.formData();
  const upstream = await fetch(`${apiBaseUrl}/public/solicitudes/${num}/documentos`, {
    method: "POST",
    body: formData as unknown as BodyInit,
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}

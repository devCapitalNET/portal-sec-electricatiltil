import { NextResponse } from "next/server";

import { api } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const num = url.searchParams.get("num");
  if (!num) return NextResponse.json({ error: "num requerido" }, { status: 400 });
  try {
    const data = await api(`/public/seguimiento/${num}/documentos`);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { api } from "@/lib/api";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const num = url.searchParams.get("num");
  if (!num) return NextResponse.json({ error: "num requerido" }, { status: 400 });
  const body = await req.json();
  try {
    const data = await api(`/public/seguimiento/${num}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = (e as Error).message;
    const match = msg.match(/^API (\d+):/);
    const httpStatus = match ? parseInt(match[1], 10) : 400;
    return NextResponse.json({ error: msg }, { status: httpStatus });
  }
}

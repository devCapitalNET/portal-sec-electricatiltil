import { NextResponse } from "next/server";

import { api } from "@/lib/api";

const TIPOS = new Set(["factibilidad", "conexion"]);

export async function POST(req: Request, { params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  if (!TIPOS.has(tipo)) {
    return NextResponse.json({ error: "Tipo de tramite invalido" }, { status: 400 });
  }
  const body = await req.json();
  try {
    const data = await api(`/public/solicitudes/${tipo}`, {
      method: "POST",
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

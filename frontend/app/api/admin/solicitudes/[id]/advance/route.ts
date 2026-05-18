import { NextResponse } from "next/server";

import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = await getAuthToken();
  const body = await req.json();
  try {
    const data = await api(`/admin/solicitudes/${id}/advance`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = (e as Error).message;
    const match = msg.match(/^API (\d+):/);
    const httpStatus = match ? parseInt(match[1], 10) : 400;
    return NextResponse.json({ error: msg }, { status: httpStatus });
  }
}

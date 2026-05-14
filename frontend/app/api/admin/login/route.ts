import { NextResponse } from "next/server";

import { api } from "@/lib/api";
import { setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const data = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    await setAuthCookie(data.access_token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}

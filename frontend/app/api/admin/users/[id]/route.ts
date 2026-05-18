import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const body = await req.text();
  const upstream = await fetch(`${apiBaseUrl}/admin/users/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });
  const text = await upstream.text();
  return new NextResponse(text || null, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = await getAuthToken();
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const upstream = await fetch(`${apiBaseUrl}/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return new NextResponse(null, { status: upstream.status });
}

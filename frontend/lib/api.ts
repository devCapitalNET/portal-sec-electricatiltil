const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL || "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ApiOptions = RequestInit & { token?: string | null };

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { token, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL || "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiBaseUrl = API_URL;

export type ApiOptions = RequestInit & { token?: string | null };

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = opts;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const baseHeaders: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    body,
    headers: {
      ...baseHeaders,
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

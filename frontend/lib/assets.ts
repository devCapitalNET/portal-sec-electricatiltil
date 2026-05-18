/**
 * Helpers para construir URLs relativas respetando NEXT_PUBLIC_BASE_PATH.
 *
 * Next.js NO prefija basePath en rutas absolutas pasadas a `fetch("/...")`
 * ni en `<img src="/...">`. Solo lo hace en <Link> y <Image>. Para todo lo
 * demas (fetch a route handlers, descargas, assets crudos) usar estos helpers.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function withBase(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}

/** Prefija basePath a una ruta absoluta de asset bajo /public. */
export function asset(path: string): string {
  return withBase(path);
}

/** Prefija basePath a una ruta de API (route handler de Next.js). */
export function apiUrl(path: string): string {
  return withBase(path);
}

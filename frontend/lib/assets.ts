/**
 * Helper para resolver rutas de assets estaticos respetando NEXT_PUBLIC_BASE_PATH.
 *
 * Los componentes <Link> y <Image> de Next.js prefijan basePath automaticamente,
 * pero los <img src="..."> y otras referencias crudas no. Usar este helper para
 * cualquier asset bajo /public que se referencie directamente.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}

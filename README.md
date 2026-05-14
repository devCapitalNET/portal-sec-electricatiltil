# Portal de Solicitudes — Electrica TilTil

POC del portal de solicitudes de **factibilidad técnica**, **conexión** y **ampliación de servicios** eléctricos para [Empresa Eléctrica Municipal de TilTil](https://electricatiltil.cl/), conforme al Oficio Circular SEC N°316998 (artículos 5-1 a 5-5 NTCSSD).

## Componentes

- **`backend/`** — FastAPI + PostgreSQL. Expone:
  - 8 endpoints SEC (Basic Auth) según Anexo Técnico N°1.
  - API admin (JWT) para gestión interna.
  - API pública para creación y seguimiento de solicitudes.
- **`frontend/`** — Next.js 15. Portal público (formularios + seguimiento) y portal interno admin.
- **`docs/`** — Anexos técnicos SEC.

## Levantar entorno de desarrollo

```bash
docker compose up --build
```

Servicios:
- API → http://localhost:8000 (Swagger en /docs)
- Portal → http://localhost:3000
- Postgres → localhost:5432 (usuario `tiltil`, password `tiltil_dev`)

Las migraciones y el seed se ejecutan automáticamente al iniciar `backend`.

## Credenciales demo (seed)

- Admin: `admin@tiltil.cl` / `admin123`
- SEC Basic Auth: `sec_demo` / `demo123`

## Probar endpoints SEC

```bash
curl -u sec_demo:demo123 -X POST http://localhost:8000/consultarSolicitudFactibilidad \
  -H "Content-Type: application/json" -d '{"NUMSOLICITUD":"2026-FT-00001"}'
```

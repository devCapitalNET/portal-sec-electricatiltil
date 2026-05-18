from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.logging_middleware import SecRequestLogMiddleware
from app.routers import (
    admin_export,
    admin_solicitudes,
    admin_users,
    auth,
    documentos,
    public,
    sec_conexion,
    sec_factibilidad,
)

app = FastAPI(
    title="Portal Solicitudes Electrica TilTil",
    description=(
        "Web Service SEC NTCSSD Art. 5-1 a 5-5 + portal interno y publico de gestion "
        "de solicitudes de factibilidad, conexion y ampliacion de servicios electricos."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecRequestLogMiddleware)


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "empresa": settings.EMPRESA_NOMBRE}


app.include_router(sec_factibilidad.router, tags=["SEC - Factibilidad"])
app.include_router(sec_conexion.router, tags=["SEC - Conexion/Ampliacion"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin_solicitudes.router, prefix="/admin", tags=["Admin"])
app.include_router(admin_users.router, prefix="/admin", tags=["Admin"])
app.include_router(admin_export.router, prefix="/admin", tags=["Admin"])
app.include_router(public.router, prefix="/public", tags=["Publico"])
app.include_router(documentos.router, tags=["Documentos"])

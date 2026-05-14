"""Middleware que captura cada request/response a endpoints SEC y los persiste para auditoria.

Anexo SEC exige conservar logs por minimo 12 meses (oficio circular 316998, punto 10).
"""

import json
import time
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.database import SessionLocal
from app.models import SecRequestLog

SEC_ENDPOINT_PREFIXES = ("/consultar",)


def is_sec_endpoint(path: str) -> bool:
    return any(path.startswith(p) for p in SEC_ENDPOINT_PREFIXES)


class SecRequestLogMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        path = request.url.path
        if not is_sec_endpoint(path):
            return await call_next(request)

        started = time.perf_counter()
        raw_body = await request.body()

        async def receive() -> dict:
            return {"type": "http.request", "body": raw_body, "more_body": False}

        request = Request(request.scope, receive)
        response = await call_next(request)

        resp_chunks: list[bytes] = []
        async for chunk in response.body_iterator:
            resp_chunks.append(chunk)
        resp_body = b"".join(resp_chunks)
        duration_ms = int((time.perf_counter() - started) * 1000)

        request_body_parsed: dict | None = None
        if raw_body:
            try:
                request_body_parsed = json.loads(raw_body)
            except (ValueError, TypeError):
                request_body_parsed = {"_raw": raw_body[:500].decode(errors="replace")}

        response_body_parsed: dict | None = None
        if resp_body:
            try:
                response_body_parsed = json.loads(resp_body)
                if isinstance(response_body_parsed, list):
                    response_body_parsed = {"_count": len(response_body_parsed)}
            except (ValueError, TypeError):
                response_body_parsed = None

        username = None
        auth = request.headers.get("authorization")
        if auth and auth.lower().startswith("basic "):
            try:
                import base64

                decoded = base64.b64decode(auth.split(" ", 1)[1]).decode()
                username = decoded.split(":", 1)[0]
            except Exception:
                username = None

        try:
            async with SessionLocal() as session:
                session.add(
                    SecRequestLog(
                        endpoint=path,
                        method=request.method,
                        request_body=request_body_parsed,
                        response_status=response.status_code,
                        response_body=response_body_parsed,
                        ip_origen=request.client.host if request.client else None,
                        username=username,
                        duration_ms=duration_ms,
                    )
                )
                await session.commit()
        except Exception:
            pass

        return Response(
            content=resp_body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type,
        )

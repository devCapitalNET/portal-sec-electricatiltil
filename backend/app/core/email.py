"""NotificationService SMTP + log a tabla notificaciones."""

from __future__ import annotations

import logging
from email.message import EmailMessage
from uuid import UUID

import aiosmtplib
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.enums import EstadoNotificacion
from app.models import NotificacionLog

logger = logging.getLogger(__name__)


async def send_email(
    db: AsyncSession,
    *,
    to: str,
    subject: str,
    html: str,
    text: str,
    template: str | None = None,
    solicitud_id: UUID | None = None,
) -> NotificacionLog:
    """Envia un email via SMTP y persiste el log. Si SMTP_HOST esta vacio,
    no falla: guarda como 'pendiente' y devuelve."""
    log = NotificacionLog(
        solicitud_id=solicitud_id,
        canal="email",
        destinatario=to,
        asunto=subject,
        cuerpo=text,
        template=template,
        estado=EstadoNotificacion.PENDIENTE.value,
    )

    if not settings.SMTP_HOST:
        logger.info(
            "SMTP no configurado, correo NO enviado pero registrado en notificaciones. to=%s subject=%s",
            to,
            subject,
        )
        db.add(log)
        return log

    msg = EmailMessage()
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER or None,
            password=settings.SMTP_PASSWORD or None,
            start_tls=settings.SMTP_TLS,
        )
        log.estado = EstadoNotificacion.ENVIADA.value
    except Exception as e:
        logger.exception("Error enviando correo a %s", to)
        log.estado = EstadoNotificacion.FALLIDA.value
        log.error = str(e)

    db.add(log)
    return log

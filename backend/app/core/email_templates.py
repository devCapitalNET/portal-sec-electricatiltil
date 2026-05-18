"""Plantillas de correo (inline). Usan str.format con placeholders simples."""

BRAND_COLOR = "#efa829"


def _wrapper(title: str, body_html: str) -> str:
    return f"""<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Instrument Sans',Arial,sans-serif;color:#1f2937">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px">
      <div style="background:{BRAND_COLOR};padding:24px 32px">
        <h1 style="margin:0;font-size:20px;color:#111827;font-weight:700">Electrica TilTil</h1>
      </div>
      <div style="padding:32px">
        <h2 style="margin:0 0 16px;font-size:18px;font-weight:600;color:#111827">{title}</h2>
        {body_html}
        <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="font-size:12px;color:#6b7280;margin:0">
          Empresa Electrica Municipal de TilTil ·
          <a href="https://electricatiltil.cl/" style="color:{BRAND_COLOR};text-decoration:none">electricatiltil.cl</a>
        </p>
      </div>
    </div>
  </body>
</html>"""


def recibo_solicitud(num_solicitud: str, requirente_nombre: str, portal_url: str) -> tuple[str, str, str]:
    title = "Recibimos tu solicitud"
    body = f"""
      <p>Hola <strong>{requirente_nombre}</strong>,</p>
      <p>Hemos recibido tu solicitud en el portal de Electrica TilTil. Tu numero de seguimiento es:</p>
      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;text-align:center;font-family:monospace;font-size:20px;font-weight:700">{num_solicitud}</div>
      <p style="margin-top:24px">Puedes consultar el avance en cualquier momento:</p>
      <p><a href="{portal_url}/seguimiento/{num_solicitud}" style="display:inline-block;background:{BRAND_COLOR};color:#111827;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Ver seguimiento</a></p>
    """
    text = (
        f"Hola {requirente_nombre},\n\n"
        f"Recibimos tu solicitud. Numero de seguimiento: {num_solicitud}.\n"
        f"Consulta el avance en: {portal_url}/seguimiento/{num_solicitud}\n"
    )
    return title, _wrapper(title, body), text


def factibilidad_admisible(num_solicitud: str, requirente_nombre: str, portal_url: str, motivo: str | None) -> tuple[str, str, str]:
    title = "Tu solicitud fue declarada ADMISIBLE"
    motivo_html = f"<p><strong>Comentarios:</strong> {motivo}</p>" if motivo else ""
    body = f"""
      <p>Hola <strong>{requirente_nombre}</strong>,</p>
      <p>Nos complace informarte que tu solicitud <strong>{num_solicitud}</strong> ha sido declarada <strong>admisible</strong>.</p>
      {motivo_html}
      <p style="margin-top:24px"><a href="{portal_url}/seguimiento/{num_solicitud}" style="display:inline-block;background:{BRAND_COLOR};color:#111827;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Ver detalles</a></p>
    """
    text = f"Tu solicitud {num_solicitud} fue declarada admisible. Consulta el detalle en {portal_url}/seguimiento/{num_solicitud}"
    return title, _wrapper(title, body), text


def factibilidad_inadmisible(num_solicitud: str, requirente_nombre: str, portal_url: str, causa: str | None, estudios: str | None) -> tuple[str, str, str]:
    title = "Tu solicitud fue declarada INADMISIBLE"
    causa_html = f"<p><strong>Causa:</strong> {causa}</p>" if causa else ""
    estudios_html = (
        f"<p><strong>Estudios tecnicos requeridos:</strong></p>"
        f"<p style=\"background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px\">{estudios}</p>"
        if estudios
        else ""
    )
    body = f"""
      <p>Hola <strong>{requirente_nombre}</strong>,</p>
      <p>Tu solicitud <strong>{num_solicitud}</strong> ha sido declarada <strong>inadmisible</strong>.</p>
      {causa_html}
      {estudios_html}
      <p style="margin-top:24px"><a href="{portal_url}/seguimiento/{num_solicitud}" style="display:inline-block;background:{BRAND_COLOR};color:#111827;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Ver detalles</a></p>
    """
    text = (
        f"Tu solicitud {num_solicitud} fue declarada inadmisible.\n"
        f"Causa: {causa or ''}\n"
        f"Estudios requeridos: {estudios or ''}\n"
        f"Detalles: {portal_url}/seguimiento/{num_solicitud}"
    )
    return title, _wrapper(title, body), text


def pendiente_informacion(num_solicitud: str, requirente_nombre: str, portal_url: str, motivo: str) -> tuple[str, str, str]:
    title = "Necesitamos informacion adicional"
    body = f"""
      <p>Hola <strong>{requirente_nombre}</strong>,</p>
      <p>Para continuar con el procesamiento de tu solicitud <strong>{num_solicitud}</strong>, necesitamos que nos entregues la siguiente informacion:</p>
      <p style="background:#fef3c7;border-left:4px solid {BRAND_COLOR};padding:12px 16px">{motivo}</p>
      <p>Puedes completar la informacion solicitada o adjuntar nuevos archivos directamente en el portal:</p>
      <p><a href="{portal_url}/seguimiento/{num_solicitud}" style="display:inline-block;background:{BRAND_COLOR};color:#111827;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Completar informacion</a></p>
    """
    text = (
        f"Tu solicitud {num_solicitud} esta pendiente de informacion del cliente.\n"
        f"Motivo: {motivo}\n"
        f"Completala en: {portal_url}/seguimiento/{num_solicitud}"
    )
    return title, _wrapper(title, body), text


def solicitud_cerrada(num_solicitud: str, requirente_nombre: str, portal_url: str) -> tuple[str, str, str]:
    title = "Solicitud cerrada"
    body = f"""
      <p>Hola <strong>{requirente_nombre}</strong>,</p>
      <p>Tu solicitud <strong>{num_solicitud}</strong> ha sido cerrada. Gracias por confiar en Electrica TilTil.</p>
      <p style="margin-top:24px"><a href="{portal_url}/seguimiento/{num_solicitud}" style="display:inline-block;background:{BRAND_COLOR};color:#111827;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Ver historial</a></p>
    """
    text = f"Tu solicitud {num_solicitud} ha sido cerrada. Historial: {portal_url}/seguimiento/{num_solicitud}"
    return title, _wrapper(title, body), text


def cliente_completo_info(num_solicitud: str, requirente_nombre: str) -> tuple[str, str, str]:
    title = f"Cliente completo informacion - {num_solicitud}"
    body = f"""
      <p>El cliente <strong>{requirente_nombre}</strong> ha actualizado la informacion solicitada para <strong>{num_solicitud}</strong>.</p>
      <p>La solicitud pasa nuevamente a estado <em>En analisis de admisibilidad</em>.</p>
    """
    text = f"Cliente actualizo informacion para {num_solicitud}. Solicitud vuelve a En analisis."
    return title, _wrapper(title, body), text

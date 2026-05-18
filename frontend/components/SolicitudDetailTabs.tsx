"use client";

import { useState } from "react";

import { DocumentList } from "./DocumentList";
import { FileUpload } from "./FileUpload";
import { SolicitudEditForm } from "./SolicitudEditForm";

import { ESTADO_ACTUAL, TIPO_FASE, TIPO_TENSION } from "@/lib/enums";

type HistorialItem = {
  id: string;
  estado_anterior: number | null;
  estado_nuevo: number;
  motivo: string | null;
  created_at: string;
};

type Solicitud = {
  id: string;
  num_solicitud: string;
  tipo_tramite: string;
  estado_actual: number;
  fecha_ingreso: string;
  fecha_ultima_actualizacion: string;
  fecha_respuesta_empresa: string | null;
  fecha_visita_terreno: string | null;
  fecha_conexion: string | null;
  requirente_rut: string;
  requirente_nombre: string;
  requirente_email: string;
  requirente_telefono: string | null;
  requirente_direccion: string;
  propietario_rut: string;
  propietario_nombre: string;
  propietario_email: string;
  propietario_telefono: string | null;
  propietario_direccion: string | null;
  direccion_instalacion: string;
  tipo_tension: number;
  tipo_fase: number;
  potencia_solicitada: number;
  concesion_id: string;
  identificador_conexion: string;
  coord_x: string;
  coord_y: string;
  respuesta_factibilidad: boolean | null;
  estudios_tecnicos_requeridos: string | null;
  causa_rechazo_notificacion: string | null;
  observaciones: string | null;
  observaciones_visita: string | null;
  presupuesto: number | null;
  detalle_presupuesto: string | null;
  modalidad_financiamiento: string | null;
  cliente_id: string | null;
  numero_medidor: string | null;
  marca_medidor: string | null;
  modelo_medidor: string | null;
  historial: HistorialItem[];
};

const TABS = ["detalle", "editar", "documentos", "historial"] as const;
type TabId = (typeof TABS)[number];

const TAB_LABEL: Record<TabId, string> = {
  detalle: "Detalle",
  editar: "Editar",
  documentos: "Documentos",
  historial: "Historial",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5 break-words">{value || "—"}</dd>
    </div>
  );
}

export function SolicitudDetailTabs({ s }: { s: Solicitud }) {
  const [tab, setTab] = useState<TabId>("detalle");
  const [docsRefresh, setDocsRefresh] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[#efa829] text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === "detalle" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4 text-lg">Requirente</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="RUT" value={s.requirente_rut} />
              <Field label="Nombre" value={s.requirente_nombre} />
              <Field label="Dirección" value={s.requirente_direccion} />
              <Field label="Email" value={s.requirente_email} />
              <Field label="Teléfono" value={s.requirente_telefono} />
            </dl>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4 text-lg">Propietario</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="RUT" value={s.propietario_rut} />
              <Field label="Nombre" value={s.propietario_nombre} />
              <Field label="Email" value={s.propietario_email} />
              <Field label="Teléfono" value={s.propietario_telefono} />
              <div className="col-span-2">
                <Field label="Dirección" value={s.propietario_direccion} />
              </div>
            </dl>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4 text-lg">Datos técnicos y ubicación</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Dirección instalación" value={s.direccion_instalacion} />
              <Field label="Tipo de tensión" value={TIPO_TENSION[s.tipo_tension]} />
              <Field label="Potencia (kW)" value={s.potencia_solicitada} />
              <Field label="Fase" value={TIPO_FASE[s.tipo_fase]} />
              <Field label="Concesión" value={s.concesion_id} />
              <Field label="ID Conexión" value={s.identificador_conexion} />
              <Field label="Coord X" value={s.coord_x} />
              <Field label="Coord Y" value={s.coord_y} />
            </dl>
          </div>

          {s.tipo_tramite === "conexion" && (
            <div className="card">
              <h2 className="font-semibold mb-4 text-lg">Conexión / Cliente</h2>
              <dl className="grid grid-cols-2 gap-4">
                <Field label="N° cliente" value={s.cliente_id} />
                <Field label="N° medidor" value={s.numero_medidor} />
                <Field label="Marca medidor" value={s.marca_medidor} />
                <Field label="Modelo medidor" value={s.modelo_medidor} />
                <Field label="Fecha visita" value={s.fecha_visita_terreno} />
                <Field label="Fecha conexión" value={s.fecha_conexion} />
                <Field
                  label="Presupuesto"
                  value={s.presupuesto != null ? `$${Number(s.presupuesto).toLocaleString("es-CL")}` : "—"}
                />
                <Field label="Modalidad financiamiento" value={s.modalidad_financiamiento} />
                <div className="col-span-2">
                  <Field label="Detalle presupuesto" value={s.detalle_presupuesto} />
                </div>
                <div className="col-span-2">
                  <Field label="Observaciones visita" value={s.observaciones_visita} />
                </div>
              </dl>
            </div>
          )}

          <div className="card">
            <h2 className="font-semibold mb-4 text-lg">Respuesta de factibilidad</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field
                label="Factibilidad"
                value={
                  s.respuesta_factibilidad === null
                    ? "—"
                    : s.respuesta_factibilidad
                    ? "Vigente"
                    : "No vigente"
                }
              />
              <Field label="Fecha respuesta empresa" value={s.fecha_respuesta_empresa} />
              <div className="col-span-2">
                <Field label="Estudios técnicos requeridos" value={s.estudios_tecnicos_requeridos} />
              </div>
              <div className="col-span-2">
                <Field label="Causa de rechazo" value={s.causa_rechazo_notificacion} />
              </div>
              <div className="col-span-2">
                <Field label="Observaciones" value={s.observaciones} />
              </div>
            </dl>
          </div>
        </div>
      )}

      {tab === "editar" && (
        <SolicitudEditForm
          id={s.id}
          initial={{
            requirente_telefono: s.requirente_telefono,
            requirente_direccion: s.requirente_direccion,
            propietario_direccion: s.propietario_direccion,
            propietario_telefono: s.propietario_telefono,
            observaciones: s.observaciones,
            observaciones_visita: s.observaciones_visita,
            fecha_visita_terreno: s.fecha_visita_terreno,
            cliente_id: s.cliente_id,
            numero_medidor: s.numero_medidor,
            marca_medidor: s.marca_medidor,
            modelo_medidor: s.modelo_medidor,
            detalle_presupuesto: s.detalle_presupuesto,
            modalidad_financiamiento: s.modalidad_financiamiento,
          }}
        />
      )}

      {tab === "documentos" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4 text-lg">Subir documento</h2>
            <FileUpload
              upload={{ mode: "admin", solicitudId: s.id }}
              onUploaded={() => setDocsRefresh((n) => n + 1)}
            />
          </div>
          <div className="card">
            <h2 className="font-semibold mb-4 text-lg">Documentos adjuntos</h2>
            <DocumentList mode={{ mode: "admin", solicitudId: s.id }} refreshKey={docsRefresh} />
          </div>
        </div>
      )}

      {tab === "historial" && (
        <div className="card">
          <h2 className="font-semibold mb-4 text-lg">Historial de cambios de estado</h2>
          <ol className="space-y-4">
            {s.historial.map((h) => (
              <li key={h.id} className="border-l-2 border-[#efa829] pl-4">
                <div className="text-xs text-gray-500">{new Date(h.created_at).toLocaleString("es-CL")}</div>
                <div className="text-sm font-medium mt-0.5">
                  {h.estado_anterior !== null ? `${ESTADO_ACTUAL[h.estado_anterior]} → ` : ""}
                  <span className="font-semibold">{ESTADO_ACTUAL[h.estado_nuevo]}</span>
                </div>
                {h.motivo && <div className="text-sm text-gray-700 mt-1">{h.motivo}</div>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

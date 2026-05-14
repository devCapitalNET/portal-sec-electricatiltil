"""Inputs (request bodies) del Web Service SEC. Campos exactos en UPPERCASE."""

from datetime import date

from pydantic import BaseModel, Field


class ConsultaNumSolicitudIn(BaseModel):
    NUMSOLICITUD: str = Field(..., max_length=30, examples=["2026-FT-00001"])


class ConsultaFechaIngresoIn(BaseModel):
    FECHAINGRESO: date = Field(..., examples=["2026-02-15"])


class ConsultaFechaTerminoIn(BaseModel):
    FECHATERMINOINGRESO: date = Field(..., examples=["2026-02-15"])


class ConsultaRutIn(BaseModel):
    RUT_RUN: str = Field(..., max_length=15, examples=["12.345.678-9"])

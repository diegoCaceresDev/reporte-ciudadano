import { z } from "zod";

export const STATUSES = ["nuevo", "verificado", "en_proceso", "derivado", "resuelto", "rechazado", "duplicado"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  nuevo: "Nuevo",
  verificado: "Verificado",
  en_proceso: "En proceso",
  derivado: "Derivado",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
  duplicado: "Duplicado",
};

export const STATUS_COLOR: Record<Status, string> = {
  nuevo: "#1c7ed6",
  verificado: "#7048e8",
  en_proceso: "#f08c00",
  derivado: "#e8590c",
  resuelto: "#2f9e44",
  rechazado: "#868e96",
  duplicado: "#868e96",
};

export const OPEN_STATUSES: Status[] = ["nuevo", "verificado", "en_proceso", "derivado"];

/** Transiciones permitidas para admin/moderador. */
const TRANSITIONS: Record<Status, Status[]> = {
  nuevo: ["verificado", "en_proceso", "derivado", "resuelto", "rechazado", "duplicado"],
  verificado: ["en_proceso", "derivado", "resuelto", "rechazado", "duplicado"],
  en_proceso: ["derivado", "resuelto", "rechazado"],
  derivado: ["en_proceso", "resuelto", "rechazado"],
  resuelto: ["en_proceso"], // reapertura si el problema vuelve
  rechazado: ["nuevo"],
  duplicado: ["nuevo"],
};

export function canTransition(from: Status, to: Status): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: Status): Status[] {
  return TRANSITIONS[from];
}

/**
 * Filtro `?status=` de la API y los tiles: un estado o "abiertos". Vacío o ausente = sin filtro.
 * Se valida antes de llegar a Postgres, que rechaza con un error 500 un valor ajeno al enum report_status.
 */
export const statusFilterSchema = z.preprocess(
  (v) => (v === null || v === "" ? undefined : v),
  z.enum([...STATUSES, "abiertos"]).optional(),
);
export type StatusFilter = Status | "abiertos";

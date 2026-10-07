import { describe, expect, it } from "vitest";
import { STATUSES, statusFilterSchema } from "../src/status";

describe("statusFilterSchema", () => {
  it.each([...STATUSES, "abiertos"])("acepta %s", (s) => {
    expect(statusFilterSchema.parse(s)).toBe(s);
  });

  it.each([undefined, null, ""])("trata %j como sin filtro", (v) => {
    expect(statusFilterSchema.parse(v)).toBeUndefined();
  });

  it.each(["foo", "Nuevo", "NUEVO", "resuleto", " nuevo", "nuevo,resuelto", "1", "'; DROP TABLE reports;--"])(
    "rechaza %j",
    (v) => {
      expect(statusFilterSchema.safeParse(v).success).toBe(false);
    },
  );
});

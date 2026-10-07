import type { APIContext } from "astro";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listReports = vi.hoisted(() => vi.fn(async (..._args: unknown[]) => []));
vi.mock("@rc/core/reports", async (orig) => ({ ...(await orig<object>()), listReports }));
vi.mock("@rc/core/photos", () => ({ reservePhotos: vi.fn() }));
vi.mock("@rc/core/ratelimit", () => ({ hit: vi.fn() }));
vi.mock("../src/lib/server/services", () => ({ presignUpload: vi.fn(), verifyTurnstile: vi.fn() }));

const { GET } = await import("../src/pages/api/reports/index");

const get = (query: string) => GET({ url: new URL(`https://ciudadano.test/api/reports${query}`), locals: {} } as unknown as APIContext);

describe("GET /api/reports ?status=", () => {
  beforeEach(() => listReports.mockClear());

  it("filtra por un estado válido", async () => {
    expect((await get("?status=resuelto")).status).toBe(200);
    expect(listReports).toHaveBeenCalledWith(expect.objectContaining({ status: "resuelto" }));
  });

  it("acepta 'abiertos'", async () => {
    expect((await get("?status=abiertos")).status).toBe(200);
    expect(listReports).toHaveBeenCalledWith(expect.objectContaining({ status: "abiertos" }));
  });

  it("sin estado o vacío no filtra", async () => {
    for (const q of ["", "?status="]) {
      expect((await get(q)).status).toBe(200);
      expect(listReports).toHaveBeenLastCalledWith(expect.objectContaining({ status: undefined }));
    }
  });

  it("un estado inválido da 400 (no 500) y no consulta la base", async () => {
    const res = await get("?status=foo");
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("validation");
    expect(listReports).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchExportCsv } from "@/lib/api";

describe("fetchExportCsv (safe masked download)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // jsdom does not implement URL.createObjectURL / revokeObjectURL.
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(
      () => "blob:mock"
    );
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn();
  });

  it("calls GET /api/export with the CSV Accept header and triggers a download", async () => {
    const clickSpy = vi.fn();
    // Save the original so the spy's implementation can call it without recursing.
    const originalCreate = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, "createElement");
    createElementSpy.mockImplementation((tag: string) => {
      const el = originalCreate(tag);
      if (tag === "a") {
        el.click = clickSpy;
      }
      return el;
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'attachment; filename="dataflow_export.csv"' },
      blob: async () => new Blob(["a,b,c\n1,2,3"]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchExportCsv();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/export"),
      expect.objectContaining({
        method: "GET",
        headers: { Accept: "text/csv" },
      })
    );
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("throws a descriptive error when the server responds not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "export failed" }),
        headers: { get: () => null },
      })
    );

    await expect(fetchExportCsv()).rejects.toThrow(/export failed/);
  });

  it("throws a connection error when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );

    await expect(fetchExportCsv()).rejects.toThrow(/Falha ao conectar/);
  });
});

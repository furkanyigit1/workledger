import { describe, it, expect } from "vitest";
import { computeIntegrityHash, verifyIntegrityHash } from "../integrity.ts";

describe("computeIntegrityHash", () => {
  it("returns a 64-char hex string (SHA-256)", async () => {
    const hash = await computeIntegrityHash({ key: "value" });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same payload", async () => {
    const payload = { dayKey: "2025-01-15", blocks: [], tags: ["a", "b"] };
    const h1 = await computeIntegrityHash(payload);
    const h2 = await computeIntegrityHash(payload);
    expect(h1).toBe(h2);
  });

  it("produces same hash regardless of key order", async () => {
    const a = await computeIntegrityHash({ x: 1, y: 2, z: 3 });
    const b = await computeIntegrityHash({ z: 3, x: 1, y: 2 });
    expect(a).toBe(b);
  });

  it("produces different hashes for different payloads", async () => {
    const a = await computeIntegrityHash({ value: 1 });
    const b = await computeIntegrityHash({ value: 2 });
    expect(a).not.toBe(b);
  });

  it("handles nested objects with consistent ordering", async () => {
    const a = await computeIntegrityHash({ outer: { b: 2, a: 1 } });
    const b = await computeIntegrityHash({ outer: { a: 1, b: 2 } });
    expect(a).toBe(b);
  });

  it("handles arrays (order-sensitive)", async () => {
    const a = await computeIntegrityHash({ tags: ["x", "y"] });
    const b = await computeIntegrityHash({ tags: ["y", "x"] });
    expect(a).not.toBe(b);
  });

  it("handles null and undefined values", async () => {
    const a = await computeIntegrityHash(null);
    const b = await computeIntegrityHash(undefined);
    // Both should produce hashes, but different ones
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(b).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("verifyIntegrityHash", () => {
  it("returns true for matching payload and hash", async () => {
    const payload = { dayKey: "2025-01-15", createdAt: 1000, blocks: [] };
    const hash = await computeIntegrityHash(payload);
    const valid = await verifyIntegrityHash(payload, hash);
    expect(valid).toBe(true);
  });

  it("returns false for tampered payload", async () => {
    const original = { dayKey: "2025-01-15", createdAt: 1000, blocks: [] };
    const hash = await computeIntegrityHash(original);
    const tampered = { dayKey: "2025-01-15", createdAt: 9999, blocks: [] };
    const valid = await verifyIntegrityHash(tampered, hash);
    expect(valid).toBe(false);
  });

  it("returns false for wrong hash", async () => {
    const payload = { data: "test" };
    const valid = await verifyIntegrityHash(payload, "0".repeat(64));
    expect(valid).toBe(false);
  });
});

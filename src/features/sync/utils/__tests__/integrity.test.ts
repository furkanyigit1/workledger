import { describe, it, expect } from "vitest";
import { computePlaintextHash, verifyPlaintextHash } from "../integrity.ts";

describe("computePlaintextHash", () => {
  it("returns a 64-char hex string (SHA-256)", async () => {
    const hash = await computePlaintextHash(JSON.stringify({ key: "value" }));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same plaintext", async () => {
    const plaintext = JSON.stringify({ dayKey: "2025-01-15", blocks: [], tags: ["a", "b"] });
    const h1 = await computePlaintextHash(plaintext);
    const h2 = await computePlaintextHash(plaintext);
    expect(h1).toBe(h2);
  });

  it("produces different hashes for different plaintexts", async () => {
    const a = await computePlaintextHash(JSON.stringify({ value: 1 }));
    const b = await computePlaintextHash(JSON.stringify({ value: 2 }));
    expect(a).not.toBe(b);
  });

  it("handles empty string", async () => {
    const hash = await computePlaintextHash("");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("verifyPlaintextHash", () => {
  it("returns true for matching plaintext and hash", async () => {
    const plaintext = JSON.stringify({ dayKey: "2025-01-15", createdAt: 1000, blocks: [] });
    const hash = await computePlaintextHash(plaintext);
    const valid = await verifyPlaintextHash(plaintext, hash);
    expect(valid).toBe(true);
  });

  it("returns false for different plaintext", async () => {
    const original = JSON.stringify({ dayKey: "2025-01-15", createdAt: 1000, blocks: [] });
    const hash = await computePlaintextHash(original);
    const tampered = JSON.stringify({ dayKey: "2025-01-15", createdAt: 9999, blocks: [] });
    const valid = await verifyPlaintextHash(tampered, hash);
    expect(valid).toBe(false);
  });

  it("returns false for wrong hash", async () => {
    const plaintext = JSON.stringify({ data: "test" });
    const valid = await verifyPlaintextHash(plaintext, "0".repeat(64));
    expect(valid).toBe(false);
  });
});

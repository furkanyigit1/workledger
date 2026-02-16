import { describe, it, expect } from "vitest";
import { encryptEntry, decryptEntry } from "../sync-crypto.ts";
import { deriveKey } from "../crypto.ts";

async function makeKey() {
  const salt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  return deriveKey("wl-test-sync-crypto", salt);
}

const sampleEntry = {
  id: "entry-123",
  dayKey: "2025-06-15",
  createdAt: 1000000,
  updatedAt: 2000000,
  blocks: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
  isArchived: false,
  tags: ["work", "meeting"],
};

describe("encryptEntry / decryptEntry", () => {
  it("round-trips an entry", async () => {
    const key = await makeKey();
    const encrypted = await encryptEntry(key, sampleEntry);
    const decrypted = await decryptEntry(key, encrypted);

    expect(decrypted.id).toBe(sampleEntry.id);
    expect(decrypted.dayKey).toBe(sampleEntry.dayKey);
    expect(decrypted.createdAt).toBe(sampleEntry.createdAt);
    expect(decrypted.updatedAt).toBe(sampleEntry.updatedAt);
    expect(decrypted.blocks).toEqual(sampleEntry.blocks);
    expect(decrypted.isArchived).toBe(false);
    expect(decrypted.isDeleted).toBe(false);
    expect(decrypted.tags).toEqual(sampleEntry.tags);
  });

  it("preserves encrypted metadata (id, updatedAt, isArchived)", async () => {
    const key = await makeKey();
    const encrypted = await encryptEntry(key, { ...sampleEntry, isArchived: true });
    expect(encrypted.id).toBe("entry-123");
    expect(encrypted.updatedAt).toBe(2000000);
    expect(encrypted.isArchived).toBe(true);
    expect(encrypted.isDeleted).toBe(false);
    expect(encrypted.encryptedPayload).toBeTruthy();
    expect(encrypted.integrityHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("handles deleted entries (no decryption needed)", async () => {
    const key = await makeKey();
    const deletedSync = {
      id: "del-1",
      updatedAt: 5000000,
      isArchived: false,
      isDeleted: true,
      encryptedPayload: "",
      integrityHash: "",
    };
    const decrypted = await decryptEntry(key, deletedSync);
    expect(decrypted.isDeleted).toBe(true);
    expect(decrypted.id).toBe("del-1");
    expect(decrypted.updatedAt).toBe(5000000);
    expect(decrypted.blocks).toEqual([]);
  });

  it("warns but still decrypts when integrity hash mismatches", async () => {
    const key = await makeKey();
    const encrypted = await encryptEntry(key, sampleEntry);
    // Tamper with the integrity hash
    const tampered = { ...encrypted, integrityHash: "0".repeat(64) };
    // Should succeed (AES-GCM already authenticates) but log a warning
    const decrypted = await decryptEntry(key, tampered);
    expect(decrypted.id).toBe(sampleEntry.id);
    expect(decrypted.blocks).toEqual(sampleEntry.blocks);
  });

  it("handles entry with empty blocks and tags", async () => {
    const key = await makeKey();
    const entry = { ...sampleEntry, blocks: [], tags: [] };
    const encrypted = await encryptEntry(key, entry);
    const decrypted = await decryptEntry(key, encrypted);
    expect(decrypted.blocks).toEqual([]);
    expect(decrypted.tags).toEqual([]);
  });

  it("handles isDeleted flag on input entry", async () => {
    const key = await makeKey();
    const entry = { ...sampleEntry, isDeleted: true };
    const encrypted = await encryptEntry(key, entry);
    expect(encrypted.isDeleted).toBe(true);
  });
});

import type { SyncEntry } from "../types/sync.ts";
import { encrypt, decrypt } from "./crypto.ts";
import { computeIntegrityHash, verifyIntegrityHash } from "./integrity.ts";

interface EntryPayload {
  dayKey: string;
  createdAt: number;
  updatedAt: number;
  blocks: unknown[];
  isArchived: boolean;
  tags: string[];
}

export interface DecryptedEntry {
  id: string;
  dayKey: string;
  createdAt: number;
  updatedAt: number;
  blocks: unknown[];
  isArchived: boolean;
  isDeleted: boolean;
  tags: string[];
}

export async function encryptEntry(
  key: CryptoKey,
  entry: { id: string; dayKey: string; createdAt: number; updatedAt: number; blocks: unknown[]; isArchived: boolean; tags: string[]; isDeleted?: boolean },
): Promise<SyncEntry> {
  const payload: EntryPayload = {
    dayKey: entry.dayKey,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    blocks: entry.blocks,
    isArchived: entry.isArchived,
    tags: entry.tags ?? [],
  };
  const plaintext = JSON.stringify(payload);
  const integrityHash = await computeIntegrityHash(payload);
  const encryptedPayload = await encrypt(key, plaintext);
  return {
    id: entry.id,
    updatedAt: entry.updatedAt,
    isArchived: entry.isArchived,
    isDeleted: entry.isDeleted ?? false,
    encryptedPayload,
    integrityHash,
  };
}

export async function decryptEntry(
  key: CryptoKey,
  syncEntry: SyncEntry,
): Promise<DecryptedEntry> {
  if (syncEntry.isDeleted) {
    return {
      id: syncEntry.id,
      dayKey: "",
      createdAt: 0,
      updatedAt: syncEntry.updatedAt,
      blocks: [],
      isArchived: false,
      isDeleted: true,
      tags: [],
    };
  }
  const plaintext = await decrypt(key, syncEntry.encryptedPayload);
  const payload = JSON.parse(plaintext) as EntryPayload;
  const valid = await verifyIntegrityHash(payload, syncEntry.integrityHash);
  if (!valid) {
    console.warn(`Integrity hash mismatch for entry ${syncEntry.id}, skipping`);
    throw new Error(`Integrity hash mismatch for entry ${syncEntry.id}`);
  }
  return {
    id: syncEntry.id,
    dayKey: payload.dayKey,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    blocks: payload.blocks,
    isArchived: payload.isArchived,
    isDeleted: false,
    tags: payload.tags ?? [],
  };
}

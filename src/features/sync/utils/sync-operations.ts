import type { SyncConfig, SyncEntry } from "../types/sync.ts";
import { apiPushEntries, apiPullEntries } from "./sync-api.ts";
import { encryptEntry, decryptEntry } from "./sync-crypto.ts";
import { mergeRemoteEntries } from "./merge.ts";
import { getAllEntries } from "../../entries/index.ts";

interface PushParams {
  key: CryptoKey;
  token: string;
  config: SyncConfig;
  dirtyIds: Set<string>;
  deletedIds: Set<string>;
  forceAll: boolean;
}

interface PushResult {
  serverSeq: number;
  syncedAt: number;
}

export async function pushEntries(params: PushParams): Promise<PushResult | null> {
  const { key, token, config, dirtyIds, deletedIds, forceAll } = params;

  const allEntries = await getAllEntries();
  const toPush = forceAll
    ? allEntries
    : dirtyIds.size > 0
      ? allEntries.filter((e) => dirtyIds.has(e.id))
      : allEntries.filter((e) => config.lastSyncAt === null || e.updatedAt > config.lastSyncAt);

  // Build deletion markers for entries removed from IDB
  const now = Date.now();
  const deletionMarkers: SyncEntry[] = [];
  for (const entryId of deletedIds) {
    deletionMarkers.push({
      id: entryId,
      updatedAt: now,
      isArchived: false,
      isDeleted: true,
      encryptedPayload: "",
      integrityHash: "",
    });
  }

  const encrypted: SyncEntry[] = await Promise.all(
    toPush.map((e) => encryptEntry(key, e)),
  );

  const allToPush = [...encrypted, ...deletionMarkers];
  if (allToPush.length === 0) return null;

  const res = await apiPushEntries(token, allToPush, config.serverUrl);
  const syncedAt = Date.now();
  return { serverSeq: res.serverSeq, syncedAt };
}

interface PullParams {
  key: CryptoKey;
  token: string;
  config: SyncConfig;
  onPhaseChange?: (phase: string) => void;
}

interface PullResult {
  serverSeq: number;
  syncedAt: number;
  totalMerged: number;
}

export async function pullEntries(params: PullParams): Promise<PullResult> {
  const { key, token, config, onPhaseChange } = params;

  let since = config.lastSyncSeq;
  let hasMore = true;
  let totalMerged = 0;

  while (hasMore) {
    const res = await apiPullEntries(token, since, 100, config.serverUrl);
    hasMore = res.hasMore;

    if (res.entries.length > 0) {
      onPhaseChange?.("merging");
      const decrypted = [];
      let batchHadFailure = false;
      for (const entry of res.entries) {
        try {
          decrypted.push(await decryptEntry(key, entry));
        } catch (err) {
          batchHadFailure = true;
          console.warn(`[sync] Failed to decrypt entry ${entry.id}:`, err instanceof Error ? err.message : err);
        }
      }

      const merged = await mergeRemoteEntries(decrypted);
      totalMerged += merged;

      // Only advance cursor past entries that were all successfully processed.
      // If any entry failed, stop at the last successful entry's seq so
      // failed entries are re-fetched on next pull.
      if (!batchHadFailure) {
        const lastEntry = res.entries[res.entries.length - 1];
        if (lastEntry.serverSeq !== undefined && lastEntry.serverSeq > since) {
          since = lastEntry.serverSeq;
        }
        if (res.serverSeq > since) {
          since = res.serverSeq;
        }
      } else {
        // Advance cursor only up to the last successfully decrypted entry
        for (const entry of res.entries) {
          const wasDecrypted = decrypted.some((d) => d.id === entry.id);
          if (wasDecrypted && entry.serverSeq !== undefined && entry.serverSeq > since) {
            since = entry.serverSeq;
          }
        }
      }
    } else if (res.serverSeq > since) {
      since = res.serverSeq;
    }
  }

  return { serverSeq: since, syncedAt: Date.now(), totalMerged };
}

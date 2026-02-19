import type { Block } from "@blocknote/core";
import type { WorkLedgerEntry } from "../types/entry.ts";
import { getDB } from "../../../storage/db.ts";
import { updateSearchIndex } from "./search-index.ts";
import { updateBacklinks } from "./backlinks.ts";
import { validateEntry, validateImportEnvelope } from "../utils/validation.ts";

interface ExportEnvelope {
  version: number;
  exportedAt: string;
  entryCount: number;
  entries: WorkLedgerEntry[];
}

export async function exportAllEntries(): Promise<void> {
  const db = await getDB();
  const entries = (await db.getAll("entries")) as WorkLedgerEntry[];

  const envelope: ExportEnvelope = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entryCount: entries.length,
    entries,
  };

  const blob = new Blob([JSON.stringify(envelope, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workledger-export-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importEntries(
  file: File,
): Promise<{ imported: number; skipped: number; invalid: number }> {
  const text = await file.text();
  const envelope = validateImportEnvelope(JSON.parse(text));

  const db = await getDB();
  let imported = 0;
  let skipped = 0;
  let invalid = 0;

  for (const raw of envelope.entries) {
    let entry: WorkLedgerEntry;
    try {
      entry = validateEntry(raw) as WorkLedgerEntry;
    } catch {
      invalid++;
      continue;
    }

    const existing = await db.get("entries", entry.id);
    if (existing && !(existing as WorkLedgerEntry).isArchived) {
      skipped++;
      continue;
    }
    await db.put("entries", entry);
    if (entry.blocks?.length) {
      await updateSearchIndex(
        entry.id,
        entry.dayKey,
        entry.blocks as Block[],
        entry.tags ?? [],
      );
      await updateBacklinks(entry.id, entry.blocks as Block[]);
    }
    imported++;
  }

  return { imported, skipped, invalid };
}

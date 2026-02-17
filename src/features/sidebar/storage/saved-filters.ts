import { getDB } from "../../../storage/db.ts";
import type { SavedFilter } from "../types/saved-filter.ts";

const SETTINGS_KEY = "savedFilters";

export async function loadSavedFilters(): Promise<SavedFilter[]> {
  const db = await getDB();
  const row = await db.get("settings", SETTINGS_KEY);
  if (!row) return [];
  try {
    return JSON.parse(row.value) as SavedFilter[];
  } catch {
    return [];
  }
}

export async function persistSavedFilters(filters: SavedFilter[]): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key: SETTINGS_KEY, value: JSON.stringify(filters) });
}

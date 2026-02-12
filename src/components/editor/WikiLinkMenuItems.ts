import {
  searchEntries,
  getRecentSearchEntries,
} from "../../storage/search-index.ts";
import { getEntry } from "../../storage/entries.ts";
import { formatDayKey, formatTime } from "../../utils/dates.ts";
import type { WorkLedgerEntry } from "../../types/entry.ts";
import type { DefaultReactSuggestionItem } from "@blocknote/react";

/**
 * Extract a short title from an entry's blocks:
 * 1. First heading block's text
 * 2. Otherwise first non-empty text content, truncated
 */
function extractTitle(entry: WorkLedgerEntry): string {
  for (const block of entry.blocks) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = block as any;
    if (b.type === "heading" && Array.isArray(b.content)) {
      const text = b.content
        .filter((c: { type: string }) => c.type === "text")
        .map((c: { text: string }) => c.text)
        .join("");
      if (text.trim()) return text.trim();
    }
  }
  // No heading — use first non-empty text
  for (const block of entry.blocks) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = block as any;
    if (Array.isArray(b.content)) {
      const text = b.content
        .filter((c: { type: string }) => c.type === "text")
        .map((c: { text: string }) => c.text)
        .join("");
      if (text.trim()) {
        const trimmed = text.trim();
        if (trimmed.length <= 50) return trimmed;
        return trimmed.slice(0, 47) + "...";
      }
    }
  }
  return "Untitled entry";
}

export async function getWikiLinkMenuItems(
  query: string,
  currentEntryId?: string,
): Promise<(DefaultReactSuggestionItem & { entryId: string; displayText: string })[]> {
  const results = query.trim()
    ? await searchEntries(query)
    : await getRecentSearchEntries(100);

  const filtered = results.filter((r) => r.entryId !== currentEntryId);

  // Verify entries exist and are not archived, then extract titles
  const verified = await Promise.all(
    filtered.map(async (r) => {
      const entry = await getEntry(r.entryId);
      if (!entry || entry.isArchived) return null;
      return { searchResult: r, entry };
    }),
  );

  return verified
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.entry.createdAt - a.entry.createdAt)
    .map(({ searchResult, entry }) => {
      const displayText = extractTitle(entry);
      const menuTitle = displayText.length > 60
        ? displayText.slice(0, 57) + "..."
        : displayText;
      return {
        title: menuTitle,
        subtext: `${formatDayKey(searchResult.dayKey)} at ${formatTime(entry.createdAt)}`,
        entryId: searchResult.entryId,
        displayText,
        onItemClick: () => {
          // handled by the SuggestionMenuController's onItemClick
        },
      };
    });
}

import {
  searchEntries,
  getRecentSearchEntries,
} from "../../storage/search-index.ts";
import { getEntry } from "../../storage/entries.ts";
import { formatDayKey } from "../../utils/dates.ts";
import type { DefaultReactSuggestionItem } from "@blocknote/react";

export async function getWikiLinkMenuItems(
  query: string,
  currentEntryId?: string,
): Promise<(DefaultReactSuggestionItem & { entryId: string; displayText: string })[]> {
  const results = query.trim()
    ? await searchEntries(query)
    : await getRecentSearchEntries(10);

  const filtered = results.filter((r) => r.entryId !== currentEntryId);

  // Verify entries exist and are not archived
  const verified = await Promise.all(
    filtered.slice(0, 12).map(async (r) => {
      const entry = await getEntry(r.entryId);
      if (!entry || entry.isArchived) return null;
      return r;
    }),
  );

  return verified
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .slice(0, 8)
    .map((r) => {
      const displayText = r.plainText.slice(0, 80).trim() || "Untitled entry";
      return {
        title: displayText,
        subtext: formatDayKey(r.dayKey),
        entryId: r.entryId,
        displayText,
        onItemClick: () => {
          // handled by the SuggestionMenuController's onItemClick
        },
      };
    });
}

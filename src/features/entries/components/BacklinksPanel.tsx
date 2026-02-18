import { useState, useEffect, useCallback, useRef, memo } from "react";
import { getBacklinks } from "../storage/backlinks.ts";
import { getEntry } from "../storage/entries.ts";
import { extractTitle } from "../utils/extract-title.ts";
import { formatDayKey } from "../../../utils/dates.ts";
import { emit, on } from "../../../utils/events.ts";

interface BacklinkEntry {
  id: string;
  title: string;
  dayKey: string;
}

interface BacklinksPanelProps {
  entryId: string;
}

export const BacklinksPanel = memo(function BacklinksPanel({ entryId }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<BacklinkEntry[]>([]);
  const [expanded, setExpanded] = useState(true);
  const knownSourceIdsRef = useRef<Set<string>>(new Set());

  const fetchBacklinks = useCallback(async () => {
    const sourceIds = await getBacklinks(entryId);
    if (sourceIds.length === 0) {
      knownSourceIdsRef.current = new Set();
      setBacklinks([]);
      return;
    }
    const entries: BacklinkEntry[] = [];
    for (const id of sourceIds) {
      const entry = await getEntry(id);
      if (entry && !entry.isArchived) {
        entries.push({ id: entry.id, title: extractTitle(entry), dayKey: entry.dayKey });
      }
    }
    knownSourceIdsRef.current = new Set(sourceIds);
    setBacklinks(entries);
  }, [entryId]);

  // Fetch on mount
  useEffect(() => {
    let cancelled = false;
    getBacklinks(entryId).then(async (sourceIds) => {
      if (cancelled || sourceIds.length === 0) {
        if (!cancelled) {
          knownSourceIdsRef.current = new Set();
          setBacklinks([]);
        }
        return;
      }
      const entries: BacklinkEntry[] = [];
      for (const id of sourceIds) {
        const entry = await getEntry(id);
        if (entry && !entry.isArchived) {
          entries.push({ id: entry.id, title: extractTitle(entry), dayKey: entry.dayKey });
        }
      }
      if (!cancelled) {
        knownSourceIdsRef.current = new Set(sourceIds);
        setBacklinks(entries);
      }
    });
    return () => { cancelled = true; };
  }, [entryId]);

  // Re-fetch when another entry changes — known sources immediately, unknown sources debounced.
  // Skip when the changed entry is ourselves (self-edits can't create backlinks to self).
  useEffect(() => {
    let debounceTimer = 0;
    const unsubChange = on("entry-changed", ({ entryId: changedId }) => {
      if (changedId === entryId) return;
      if (knownSourceIdsRef.current.has(changedId)) {
        // Known source changed (title, archive, link removal) — re-fetch immediately
        fetchBacklinks();
      } else {
        // Unknown entry changed — could be a new backlink source, debounce the re-fetch
        clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => { fetchBacklinks(); }, 2_000);
      }
    });
    const unsubDelete = on("entry-deleted", ({ entryId: deletedId }) => {
      if (knownSourceIdsRef.current.has(deletedId)) {
        fetchBacklinks();
      }
    });
    return () => { unsubChange(); unsubDelete(); clearTimeout(debounceTimer); };
  }, [fetchBacklinks, entryId]);

  if (backlinks.length === 0) return null;

  return (
    <div className="mx-1 mt-1 mb-1 rounded-lg bg-[var(--color-notebook-surface-alt)] border border-[var(--color-notebook-border)] px-3 py-2">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 text-[11px] text-[var(--color-notebook-muted)] hover:text-[var(--color-notebook-text)] transition-colors w-full"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="uppercase tracking-wider font-medium">Referenced by</span>
        <span className="text-[10px] opacity-60">{backlinks.length}</span>
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {backlinks.map((bl) => (
            <button
              key={bl.id}
              onClick={() => emit("navigate-entry", { entryId: bl.id })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              title={formatDayKey(bl.dayKey)}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {bl.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

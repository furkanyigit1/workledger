import { useState, useCallback, memo } from "react";
import type { WorkLedgerEntry } from "../types/entry.ts";
import { formatTime, todayKey } from "../../../utils/dates.ts";
import { EntryEditor } from "../../editor/index.ts";
import { TagEditor } from "./TagEditor.tsx";
import { ConfirmAction } from "../../../components/ui/ConfirmAction.tsx";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary.tsx";
import { CheckIcon, ArchiveIcon, TrashIcon, AIIcon } from "../../../components/ui/Icons.tsx";

interface EntryCardProps {
  entry: WorkLedgerEntry;
  isLatest: boolean;
  onSave: (entry: WorkLedgerEntry) => Promise<void>;
  onTagsChange?: (entryId: string, dayKey: string, tags: string[]) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  isArchiveView?: boolean;
  onOpenAI?: (entry: WorkLedgerEntry) => void;
  onFocus?: (entry: WorkLedgerEntry) => void;
}

export const EntryCard = memo(function EntryCard({ entry, isLatest, onSave, onTagsChange, onArchive, onDelete, onUnarchive, isArchiveView, onOpenAI, onFocus }: EntryCardProps) {
  const isOld = entry.dayKey < todayKey();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#entry-${entry.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [entry.id]);

  return (
    <div className="entry-card group scroll-mt-[120px]" id={`entry-${entry.id}`}>
      <div className="flex items-center gap-3 mb-2 px-1">
        <span className="text-sm text-gray-400 dark:text-gray-500 font-mono">
          {formatTime(entry.createdAt)}
        </span>
        {isOld && !isArchiveView && (
          <span className="text-[11px] text-gray-300 dark:text-gray-600 uppercase tracking-wider">
            past
          </span>
        )}
        {isArchiveView && (
          <span className="text-[11px] text-amber-400 dark:text-amber-500 uppercase tracking-wider">
            archived
          </span>
        )}

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-1">
          {/* Copy link button */}
          {!isArchiveView && !confirmArchive && !confirmDelete && (
            <button
              onClick={handleCopyLink}
              className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
              title={linkCopied ? "Link copied!" : "Copy link to entry"}
              aria-label={linkCopied ? "Link copied" : "Copy link to entry"}
            >
              {linkCopied ? (
                <CheckIcon />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </button>
          )}
          {/* Focus mode button */}
          {onFocus && !isArchiveView && !confirmArchive && !confirmDelete && (
            <button
              onClick={() => onFocus(entry)}
              className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
              title="Focus on this entry"
              aria-label="Focus on this entry"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </button>
          )}
          {/* Think with AI button */}
          {onOpenAI && !isArchiveView && !confirmArchive && !confirmDelete && (
            <button
              onClick={() => onOpenAI(entry)}
              className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-950 text-gray-300 dark:text-gray-600 hover:text-orange-500"
              title="Think with AI"
              aria-label="Think with AI"
            >
              <AIIcon />
            </button>
          )}
          {/* Normal view: archive + delete */}
          {!isArchiveView && (confirmArchive || confirmDelete) ? (
            confirmArchive ? (
              <ConfirmAction
                label="Archive?"
                onConfirm={() => { onArchive?.(entry.id); setConfirmArchive(false); }}
                onCancel={() => setConfirmArchive(false)}
              />
            ) : (
              <ConfirmAction
                label="Delete forever?"
                onConfirm={() => { onDelete?.(entry.id); setConfirmDelete(false); }}
                onCancel={() => setConfirmDelete(false)}
                danger
              />
            )
          ) : !isArchiveView ? (
            <>
              {onArchive && (
                <button
                  onClick={() => setConfirmArchive(true)}
                  className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400"
                  title="Archive entry"
                  aria-label="Archive entry"
                >
                  <ArchiveIcon />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 dark:text-gray-600 hover:text-red-400"
                  title="Delete entry permanently"
                  aria-label="Delete entry permanently"
                >
                  <TrashIcon />
                </button>
              )}
            </>
          ) : null}

          {/* Archive view: restore + delete */}
          {isArchiveView && confirmDelete ? (
            <ConfirmAction
              label="Delete forever?"
              onConfirm={() => { onDelete?.(entry.id); setConfirmDelete(false); }}
              onCancel={() => setConfirmDelete(false)}
              danger
            />
          ) : isArchiveView ? (
            <>
              {onUnarchive && (
                <button
                  onClick={() => onUnarchive(entry.id)}
                  className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 dark:text-gray-600 hover:text-green-500"
                  title="Restore entry"
                  aria-label="Restore entry"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 dark:text-gray-600 hover:text-red-400"
                  title="Delete entry permanently"
                  aria-label="Delete entry permanently"
                >
                  <TrashIcon />
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
      {onTagsChange && !isArchiveView && (
        <div className="mb-2">
          <TagEditor
            tags={entry.tags ?? []}
            onChange={(tags) => onTagsChange(entry.id, entry.dayKey, tags)}
          />
        </div>
      )}
      {isArchiveView && entry.tags?.length > 0 && (
        <div className="mb-2 px-1">
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      <div
        className={`
          rounded-xl transition-all duration-200
          ${isOld || isArchiveView ? "opacity-80" : ""}
        `}
      >
        <ErrorBoundary fallback={
          <div className="text-center py-8 text-sm text-[var(--color-notebook-muted)]">
            Editor failed to load.{" "}
            <button className="text-[var(--color-notebook-accent)] hover:underline" onClick={() => window.location.reload()}>Reload</button>
          </div>
        }>
          <EntryEditor
            entry={entry}
            editable={!isArchiveView}
            onSave={onSave}
            autoFocus={isLatest && !isOld && !isArchiveView}
          />
        </ErrorBoundary>
      </div>
      <div className="entry-ruling mt-4 mb-4" />
    </div>
  );
}, (prev, next) =>
  prev.entry.updatedAt === next.entry.updatedAt &&
  prev.isLatest === next.isLatest &&
  !!prev.onOpenAI === !!next.onOpenAI &&
  !!prev.onFocus === !!next.onFocus &&
  prev.isArchiveView === next.isArchiveView,
);

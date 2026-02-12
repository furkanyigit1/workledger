import { useState, useRef } from "react";
import { formatDayKey, todayKey } from "../../utils/dates.ts";
import { getTagColor } from "../../utils/tag-colors.ts";
import { exportAllEntries, importEntries } from "../../storage/import-export.ts";

interface SidebarProps {
  dayKeys: string[];
  entriesByDay: Map<string, unknown[]>;
  isOpen: boolean;
  onToggle: () => void;
  onDayClick: (dayKey: string) => void;
  sidebarSearchQuery: string;
  onSidebarSearch: (query: string) => void;
  onSearchOpen: () => void;
  allTags: string[];
  onTagClick: (tag: string) => void;
  onRefresh: () => void;
}

export function Sidebar({
  dayKeys,
  entriesByDay,
  isOpen,
  onToggle,
  onDayClick,
  sidebarSearchQuery,
  onSidebarSearch,
  onSearchOpen,
  allTags,
  onTagClick,
  onRefresh,
}: SidebarProps) {
  const today = todayKey();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  return (
    <>
      {/* Toggle button — only visible when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 text-gray-400 hover:text-gray-600"
          title="Expand sidebar (⌘\)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          bg-white border-r border-gray-100
          shadow-[1px_0_12px_rgba(0,0,0,0.03)]
          transition-transform duration-300 ease-in-out
          w-80 pt-5 pb-5 px-5
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header row: logo + title + collapse chevron */}
        <div className="mb-5 flex items-center gap-3 shrink-0">
          <a href="https://about.workledger.org" target="_blank" rel="noopener" className="flex items-center gap-3 flex-1 min-w-0">
            <img src="/logo.svg" alt="WorkLedger" className="w-9 h-9 shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl text-gray-800 sidebar-title-font leading-tight">
                WorkLedger
              </h1>
              <p className="text-xs text-gray-400 -mt-0.5">
                Engineering Notebook
              </p>
            </div>
          </a>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            title="Collapse sidebar (⌘\)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Search filter input */}
        <div className="mb-3 shrink-0">
          <div className="relative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={sidebarSearchQuery}
              onChange={(e) => onSidebarSearch(e.target.value)}
              placeholder="Filter entries..."
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-7 py-2 outline-none focus:border-orange-300 focus:bg-white focus:ring-1 focus:ring-orange-100 transition-all text-gray-600 placeholder:text-gray-400"
            />
            {sidebarSearchQuery && (
              <button
                onClick={() => onSidebarSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={onSearchOpen}
            className="text-sm text-gray-400 hover:text-gray-500 mt-1.5 ml-0.5 transition-colors"
          >
            Full search <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">⌘K</kbd>
          </button>
        </div>

        {/* Day list — scrollable, takes remaining space */}
        <nav className="flex-1 overflow-y-auto -mx-2 min-h-0">
          {dayKeys.length === 0 ? (
            <p className="text-sm text-gray-400 px-2">No entries yet</p>
          ) : (
            dayKeys.map((dayKey) => {
              const count = entriesByDay.get(dayKey)?.length || 0;
              const isToday = dayKey === today;
              return (
                <button
                  key={dayKey}
                  onClick={() => onDayClick(dayKey)}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-lg text-base
                    transition-colors duration-150
                    flex items-center justify-between gap-2
                    ${
                      isToday
                        ? "bg-orange-50 text-orange-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  <span className="truncate">
                    {formatDayKey(dayKey)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {count > 0 && (
                      <span
                        className={`
                          w-1.5 h-1.5 rounded-full
                          ${isToday ? "bg-orange-400" : "bg-gray-300"}
                        `}
                      />
                    )}
                    <span className={`text-xs ${isToday ? "text-orange-500" : "text-gray-400"}`}>{count}</span>
                  </span>
                </button>
              );
            })
          )}
        </nav>

        {/* Tags section — pinned at bottom */}
        {allTags.length > 0 && (
          <div className="shrink-0 pt-3 mt-3 border-t border-gray-100">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-2.5 px-1">Tags</p>
            <div className="flex flex-wrap gap-2 px-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className={`
                    px-2.5 py-1 rounded-full text-xs font-medium
                    transition-opacity hover:opacity-80
                    ${getTagColor(tag)}
                    ${sidebarSearchQuery === tag ? "ring-2 ring-offset-1 ring-gray-300" : ""}
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Import / Export */}
        <div className="shrink-0 pt-3 mt-3 border-t border-gray-100 flex items-center gap-2 px-1">
          <button
            onClick={exportAllEntries}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Export all entries"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Import entries"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const result = await importEntries(file);
                setImportStatus(`${result.imported} imported, ${result.skipped} skipped`);
                onRefresh();
                setTimeout(() => setImportStatus(null), 3000);
              } catch {
                setImportStatus("Import failed: invalid file");
                setTimeout(() => setImportStatus(null), 3000);
              }
              e.target.value = "";
            }}
          />
          {importStatus && (
            <span className="text-xs text-gray-500">{importStatus}</span>
          )}
        </div>

      </aside>
    </>
  );
}

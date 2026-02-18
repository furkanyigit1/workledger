import { useState, useRef, useCallback, memo } from "react";
import { ENTRY_TEMPLATES, type EntryTemplate } from "../utils/templates.ts";
import { useClickOutside } from "../../../hooks/useClickOutside.ts";

interface NewEntryButtonProps {
  onClick: () => void;
  onCreateFromTemplate?: (template: EntryTemplate) => void;
  aiSidebarOpen?: boolean;
}

export const NewEntryButton = memo(function NewEntryButton({ onClick, onCreateFromTemplate, aiSidebarOpen }: NewEntryButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useClickOutside(menuRef, closeMenu, menuOpen);

  return (
    <div
      ref={menuRef}
      className={`fixed bottom-8 z-[999] ${aiSidebarOpen ? "right-[26rem]" : "right-8"}`}
    >
      {/* Template menu */}
      {menuOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-52 bg-[var(--color-notebook-surface)] border border-[var(--color-notebook-border)] rounded-xl shadow-xl overflow-hidden">
          {ENTRY_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onCreateFromTemplate?.(template);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-notebook-text)] hover:bg-[var(--color-notebook-surface-alt)] transition-colors flex items-center gap-2.5"
            >
              <span className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 shrink-0">
                {template.icon}
              </span>
              {template.name}
            </button>
          ))}
        </div>
      )}

      <div
        className="
          flex items-stretch
          rounded-full
          shadow-lg shadow-orange-500/20 dark:shadow-orange-500/30
          hover:shadow-xl hover:shadow-orange-500/25 dark:hover:shadow-orange-500/35
          transition-shadow duration-300 ease-in-out
        "
      >
        {/* Main button */}
        <button
          onClick={onClick}
          className="
            flex items-center gap-2
            bg-orange-500 hover:bg-orange-400 active:bg-orange-600
            text-white font-medium
            px-6 py-3.5 rounded-l-full
            transition-colors duration-200
          "
          title="New Entry (⌘J)"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-sm">New Entry</span>
        </button>

        {/* Divider */}
        <div className="w-px bg-orange-400/40 self-stretch" />

        {/* Template dropdown toggle */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="
            flex items-center
            bg-orange-500 hover:bg-orange-400 active:bg-orange-600
            text-white
            px-2.5 rounded-r-full
            transition-colors duration-200
          "
          title="New from template"
          aria-label="New from template"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
});

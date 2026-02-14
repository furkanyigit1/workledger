import { useEffect, useCallback } from "react";
import { useEntriesActions } from "../features/entries/index.ts";
import { useSidebarUI, useSidebarFilter } from "../features/sidebar/index.ts";
import { useFocusModeContext } from "../features/focus-mode/index.ts";
import { useAIContext } from "../features/ai/index.ts";

interface SearchControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export function useKeyboardShortcuts(search: SearchControls) {
  const { createEntry } = useEntriesActions();
  const { archiveView, toggleSidebar } = useSidebarUI();
  const { hasActiveFilters, clearAllFilters } = useSidebarFilter();
  const { focusedEntryId, handleExitFocus } = useFocusModeContext();
  const { settings: aiSettings, handleToggleAISidebar } = useAIContext();

  const handleNewEntry = useCallback(async () => {
    const entry = await createEntry();
    setTimeout(() => {
      document.getElementById(`entry-${entry.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [createEntry]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        if (!archiveView) handleNewEntry();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (search.isOpen) {
          search.close();
        } else {
          search.open();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        if (aiSettings.enabled) {
          handleToggleAISidebar();
        }
      }
      if (e.key === "Escape" && focusedEntryId) {
        handleExitFocus();
      } else if (e.key === "Escape" && hasActiveFilters) {
        clearAllFilters();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleNewEntry, search, hasActiveFilters, archiveView, aiSettings.enabled, handleToggleAISidebar, focusedEntryId, handleExitFocus, toggleSidebar, clearAllFilters]);

  return { handleNewEntry };
}

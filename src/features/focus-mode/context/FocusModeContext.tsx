import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import type { WorkLedgerEntry } from "../../entries/index.ts";

interface FocusModeContextValue {
  focusedEntryId: string | null;
  handleFocusEntry: (entry: WorkLedgerEntry) => void;
  handleExitFocus: () => void;
}

const FocusModeCtx = createContext<FocusModeContextValue | null>(null);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(null);
  const scrollRestoreId = useRef<string | null>(null);

  const handleFocusEntry = useCallback((entry: WorkLedgerEntry) => {
    setFocusedEntryId(entry.id);
    history.replaceState(null, "", `#entry-${entry.id}`);
  }, []);

  const handleExitFocus = useCallback(() => {
    scrollRestoreId.current = focusedEntryId;
    setFocusedEntryId(null);
    history.replaceState(null, "", window.location.pathname);
  }, [focusedEntryId]);

  // After exiting focus mode, scroll to the entry that was focused
  useEffect(() => {
    if (focusedEntryId === null && scrollRestoreId.current) {
      const entryId = scrollRestoreId.current;
      scrollRestoreId.current = null;
      requestAnimationFrame(() => {
        const el = document.getElementById(`entry-${entryId}`);
        if (el) {
          el.scrollIntoView({ behavior: "instant", block: "start" });
        }
      });
    }
  }, [focusedEntryId]);

  return (
    <FocusModeCtx.Provider value={{ focusedEntryId, handleFocusEntry, handleExitFocus }}>
      {children}
    </FocusModeCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFocusModeContext(): FocusModeContextValue {
  const ctx = useContext(FocusModeCtx);
  if (!ctx) throw new Error("useFocusModeContext must be used within FocusModeProvider");
  return ctx;
}

import { type ReactNode, useCallback } from "react";
import { useTheme, ThemeContext } from "../features/theme/index.ts";
import { EntriesProvider } from "../features/entries/index.ts";
import { SidebarProvider, useSidebarContext } from "../features/sidebar/index.ts";
import { FocusModeProvider } from "../features/focus-mode/index.ts";
import { AIProvider } from "../features/ai/index.ts";

function AIProviderWithSidebar({ children }: { children: ReactNode }) {
  const { setSidebarOpen } = useSidebarContext();
  const onCollapseSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);

  return (
    <AIProvider onCollapseSidebar={onCollapseSidebar}>
      {children}
    </AIProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const { resolved: themeMode } = useTheme();

  return (
    <ThemeContext.Provider value={themeMode}>
      <EntriesProvider>
        <SidebarProvider>
          <FocusModeProvider>
            <AIProviderWithSidebar>
              {children}
            </AIProviderWithSidebar>
          </FocusModeProvider>
        </SidebarProvider>
      </EntriesProvider>
    </ThemeContext.Provider>
  );
}

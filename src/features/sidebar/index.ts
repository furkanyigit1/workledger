// Public API for the sidebar feature
export { Sidebar } from "./components/Sidebar.tsx";
export { SidebarProvider, useSidebarContext, useSidebarUI, useSidebarFilter, useSidebarData } from "./context/SidebarContext.tsx";
export { SaveFilterButton, SavedFilterSection } from "./components/SavedFilters.tsx";
export type { SavedFilter } from "./types/saved-filter.ts";

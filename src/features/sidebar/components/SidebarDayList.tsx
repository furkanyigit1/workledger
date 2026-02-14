import { memo } from "react";
import { formatDayKey, todayKey } from "../../../utils/dates.ts";

interface SidebarDayListProps {
  dayKeys: string[];
  entriesByDay: Map<string, unknown[]>;
  isArchiveView: boolean;
  activeDayKey?: string | null;
  onDayClick: (dayKey: string) => void;
}

export const SidebarDayList = memo(function SidebarDayList({ dayKeys, entriesByDay, isArchiveView, activeDayKey, onDayClick }: SidebarDayListProps) {
  const today = todayKey();

  return (
    <nav className="flex-1 overflow-y-auto -mx-2 min-h-0">
      {dayKeys.length === 0 ? (
        <p className="text-sm text-gray-400 px-2">
          {isArchiveView ? "No archived entries" : "No entries yet"}
        </p>
      ) : (
        dayKeys.map((dayKey) => {
          const count = entriesByDay.get(dayKey)?.length || 0;
          const isToday = dayKey === today && !isArchiveView;
          const isActive = activeDayKey === dayKey && !isArchiveView;
          const isHighlighted = isActive || (isToday && !activeDayKey);
          return (
            <button
              key={dayKey}
              onClick={() => onDayClick(dayKey)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm
                transition-colors duration-150
                flex items-center justify-between gap-2
                ${isHighlighted ? "sidebar-day-active font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}
              `}
            >
              <span className="truncate">
                {formatDayKey(dayKey)}
              </span>
              <span className="flex items-center gap-1.5">
                {count > 0 && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isHighlighted ? "sidebar-day-dot" : "bg-gray-300 dark:bg-gray-600"}`}
                  />
                )}
                <span className={`text-xs ${isHighlighted ? "sidebar-day-count" : "text-gray-400 dark:text-gray-500"}`}>{count}</span>
              </span>
            </button>
          );
        })
      )}
    </nav>
  );
});

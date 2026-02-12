import { formatDayKey } from "../../utils/dates.ts";

interface DayHeaderProps {
  dayKey: string;
  entryCount: number;
}

export function DayHeader({ dayKey, entryCount }: DayHeaderProps) {
  return (
    <div className="day-header flex items-baseline gap-3 pt-8 pb-5 px-1 sticky top-0 z-10 bg-[#fafafa]/95 backdrop-blur-sm border-b border-gray-100">
      <h2 className="text-gray-800 day-header-font">
        {formatDayKey(dayKey)}
      </h2>
      <span className="text-sm text-gray-400">
        {entryCount} {entryCount === 1 ? "entry" : "entries"}
      </span>
    </div>
  );
}

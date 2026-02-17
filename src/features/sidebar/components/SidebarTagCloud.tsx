import { getTagColor } from "../../../utils/tag-colors.ts";

interface SidebarTagCloudProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SidebarTagCloud({ allTags, selectedTags, onToggleTag, collapsed, onToggleCollapse }: SidebarTagCloudProps) {
  if (allTags.length === 0) return null;

  const isExpanded = !collapsed;

  return (
    <div>
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-1.5 w-full text-left px-1 mb-2"
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
          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className={`uppercase tracking-wider text-gray-400 font-medium ${isExpanded ? "text-[11px]" : "text-xs"}`}>
          Tags
        </span>
        <span className={`text-gray-300 ml-1 ${isExpanded ? "text-[10px]" : "text-[11px]"}`}>{allTags.length}</span>
      </button>
      {isExpanded && (
        <div className="flex flex-wrap gap-1.5 px-1 pt-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={`
                px-2 py-0.5 rounded-full text-[11px] font-medium
                transition-opacity hover:opacity-80
                ${getTagColor(tag)}
                ${selectedTags.includes(tag) ? "ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500" : ""}
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

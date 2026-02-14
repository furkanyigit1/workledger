interface IconProps {
  size?: number;
  className?: string;
}

function svg(size: number, className: string | undefined, children: React.ReactNode) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

export function CloseIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </>);
}

export function ArchiveIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <>
    <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
  </>);
}

export function ChevronRightIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <polyline points="9 18 15 12 9 6" />);
}

export function ChevronLeftIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <polyline points="15 18 9 12 15 6" />);
}

export function CheckIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <polyline points="20 6 9 17 4 12" />);
}

export function TrashIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </>);
}

export function AIIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <>
    <path d="M12 2a8 8 0 0 0-8 8c0 3.36 2.07 6.24 5 7.42V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.58c2.93-1.18 5-4.06 5-7.42a8 8 0 0 0-8-8z" />
    <line x1="9" y1="22" x2="15" y2="22" />
  </>);
}

export function SearchIcon({ size = 14, className }: IconProps) {
  return svg(size, className, <>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>);
}

export function SettingsIcon({ size = 15, className }: IconProps) {
  return svg(size, className, <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>);
}

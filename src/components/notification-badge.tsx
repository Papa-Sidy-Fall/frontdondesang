interface NotificationBadgeProps {
  count: number;
  className?: string;
}

function formatCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function NotificationBadge({ count, className = "" }: NotificationBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white ${className}`.trim()}
    >
      {formatCount(count)}
    </span>
  );
}

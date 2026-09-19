import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  count: number;
  className?: string;
}

/**
 * Unread-alert counter for the header bell. Renders nothing when the
 * count is zero so the bell stays visually quiet.
 */
export function AlertBadge({ count, className }: AlertBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : count.toString();

  return (
    <Badge
      data-ocid="alert.unread_badge"
      aria-label={`${count} alertas sin leer`}
      className={cn(
        "absolute -right-1.5 -top-1.5 h-5 min-w-5 justify-center rounded-full border-2 border-card bg-destructive px-1 text-[0.65rem] font-semibold leading-none text-destructive-foreground",
        className,
      )}
    >
      {label}
    </Badge>
  );
}

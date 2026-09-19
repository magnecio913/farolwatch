import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatTone = "primary" | "success" | "warning" | "destructive";

const TONE_DOT: Record<StatTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

const TONE_ICON: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
  pulse?: boolean;
  ocid: string;
}

/** Compact KPI tile used across the dashboard summary row. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  pulse = false,
  ocid,
}: StatCardProps) {
  return (
    <Card
      data-ocid={ocid}
      className="gap-0 rounded-xl border-border py-4 shadow-subtle transition-smooth hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="label-caps truncate">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold leading-none tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 truncate text-xs text-muted-foreground">
              {hint}
            </p>
          )}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            TONE_ICON[tone],
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 px-4">
        <span
          className={cn(
            "size-2 rounded-full",
            TONE_DOT[tone],
            pulse && "animate-status-pulse",
          )}
          aria-hidden="true"
        />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </Card>
  );
}

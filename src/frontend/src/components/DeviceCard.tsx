import type { LinkedDeviceView } from "@/backend";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Smartphone, Unlink } from "lucide-react";

interface DeviceCardProps {
  device: LinkedDeviceView;
  index: number;
  onUnlink: (device: LinkedDeviceView) => void;
}

/** One linked phone with its link date and an unlink action. */
export function DeviceCard({ device, index, onUnlink }: DeviceCardProps) {
  return (
    <article
      data-ocid={`device.item.${index + 1}`}
      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-subtle transition-smooth hover:border-primary/40"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Smartphone className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-semibold text-foreground">
          {device.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Vinculado el {formatDate(device.linkedAt)}
        </p>
      </div>

      <Button
        data-ocid={`device.unlink_button.${index + 1}`}
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onUnlink(device)}
      >
        <Unlink aria-hidden="true" />
        <span className="hidden sm:inline">Desvincular</span>
      </Button>
    </article>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLinkDevice } from "@/hooks/useBackend";
import { Loader2, Smartphone } from "lucide-react";
import { useState } from "react";

interface LinkDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Links a mobile phone as a registered device by name. */
export function LinkDeviceDialog({
  open,
  onOpenChange,
}: LinkDeviceDialogProps) {
  const [name, setName] = useState("");
  const linkDevice = useLinkDevice();

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && !linkDevice.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const pendingName = trimmed;
    setName("");
    linkDevice.mutate(pendingName, {
      onSuccess: () => onOpenChange(false),
      onError: () =>
        setName((current) => (current === "" ? pendingName : current)),
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("");
      linkDevice.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-ocid="device.link.dialog" className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Smartphone className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg">
                Vincular un celular
              </DialogTitle>
              <DialogDescription className="mt-1">
                Ponle un nombre reconocible para identificarlo en la lista de
                dispositivos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Nombre del dispositivo</Label>
            <Input
              id="device-name"
              data-ocid="device.link.name_input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Celular de guardia"
              autoComplete="off"
              maxLength={60}
              aria-invalid={linkDevice.isError}
            />
            <p className="text-xs text-muted-foreground">
              Ejemplo: “Celular de guardia” o “Teléfono de la caseta”.
            </p>
          </div>

          {linkDevice.isError && (
            <p
              data-ocid="device.link.error_state"
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              No se pudo vincular el dispositivo. Intenta de nuevo.
            </p>
          )}

          <DialogFooter>
            <Button
              data-ocid="device.link.cancel_button"
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              data-ocid="device.link.submit_button"
              type="submit"
              className="rounded-full"
              disabled={!canSubmit}
            >
              {linkDevice.isPending && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              Vincular dispositivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

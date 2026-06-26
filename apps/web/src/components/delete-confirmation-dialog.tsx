"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DeleteConfirmationDialogProps = {
  title: string;
  description: ReactNode;
  trigger: ReactNode;
  onConfirm: () => Promise<void> | void;
  confirmLabel?: string;
  pendingLabel?: string;
};

export function DeleteConfirmationDialog({
  title,
  description,
  trigger,
  onConfirm,
  confirmLabel = "Delete",
  pendingLabel = "Deleting...",
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isConfirming) {
          setOpen(nextOpen);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              {description}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isConfirming}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming && <Loader2 className="animate-spin" />}
            {isConfirming ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

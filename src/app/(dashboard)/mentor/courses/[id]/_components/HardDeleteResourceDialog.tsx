"use client";

import { HardDeleteDialog } from "@/components/dialogs/HardDeleteDialog";

interface HardDeleteResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function HardDeleteResourceDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: HardDeleteResourceDialogProps) {
  return (
    <HardDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isLoading={isLoading}
      itemName="Resource"
      description="Are you sure you want to permanently delete this resource? This action cannot be undone and will remove the file from the server."
    />
  );
}

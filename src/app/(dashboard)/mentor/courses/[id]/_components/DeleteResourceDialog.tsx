"use client";

import { DeleteDialog } from "@/components/dialogs/DeleteDialog";

interface DeleteResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteResourceDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteResourceDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isLoading={isLoading}
      itemName="Resource"
    />
  );
}

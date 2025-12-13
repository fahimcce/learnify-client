"use client";

import { DeleteDialog } from "@/components/dialogs/DeleteDialog";

interface DeleteQuizSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteQuizSetDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteQuizSetDialogProps) {
  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isLoading={isLoading}
      itemName="Quiz Set"
    />
  );
}

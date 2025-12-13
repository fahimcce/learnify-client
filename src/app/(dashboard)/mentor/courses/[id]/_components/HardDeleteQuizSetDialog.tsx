"use client";

import { HardDeleteDialog } from "@/components/dialogs/HardDeleteDialog";

interface HardDeleteQuizSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function HardDeleteQuizSetDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: HardDeleteQuizSetDialogProps) {
  return (
    <HardDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isLoading={isLoading}
      itemName="Quiz Set"
      description="Are you sure you want to permanently delete this quiz set? This action cannot be undone and will remove all questions."
    />
  );
}

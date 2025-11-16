"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isBlocked: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function BlockUserDialog({
  open,
  onOpenChange,
  isBlocked,
  onConfirm,
  isLoading,
}: BlockUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlocked ? "Unblock User?" : "Block User?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBlocked
              ? "This will allow the user to access the platform again."
              : "This will prevent the user from accessing the platform."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isBlocked ? (
              "Unblock"
            ) : (
              "Block"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

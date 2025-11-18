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

interface RegenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function RegenerateDialog({
  open,
  onOpenChange,
  onRegenerate,
  isRegenerating,
}: RegenerateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Regenerate Learning Path?</AlertDialogTitle>
          <AlertDialogDescription>
            This will generate a new learning path for this course. The previous
            path will be replaced.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRegenerating}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onRegenerate} disabled={isRegenerating}>
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              "Regenerate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

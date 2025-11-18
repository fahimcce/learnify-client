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

interface NoteDeleteDialogsProps {
  deleteNoteId: string | null;
  hardDeleteNoteId: string | null;
  onDeleteCancel: () => void;
  onHardDeleteCancel: () => void;
  onDelete: () => void;
  onHardDelete: () => void;
  isDeleting: boolean;
  isHardDeleting: boolean;
}

export function NoteDeleteDialogs({
  deleteNoteId,
  hardDeleteNoteId,
  onDeleteCancel,
  onHardDeleteCancel,
  onDelete,
  onHardDelete,
  isDeleting,
  isHardDeleting,
}: NoteDeleteDialogsProps) {
  return (
    <>
      {/* Delete Note Confirmation Dialog */}
      <AlertDialog
        open={!!deleteNoteId}
        onOpenChange={(open) => !open && onDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the note. The note can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Note Confirmation Dialog */}
      <AlertDialog
        open={!!hardDeleteNoteId}
        onOpenChange={(open) => !open && onHardDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note and its file from the database and filesystem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHardDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onHardDelete}
              disabled={isHardDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isHardDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

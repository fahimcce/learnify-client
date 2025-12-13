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

interface UnassignCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorName?: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function UnassignCourseDialog({
  open,
  onOpenChange,
  mentorName,
  onConfirm,
  isLoading,
}: UnassignCourseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unassign Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unassign this course from {mentorName}?
            This action can be undone by reassigning the course.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unassigning...
              </>
            ) : (
              "Unassign"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

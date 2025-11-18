"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, GraduationCap } from "lucide-react";

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLevel: number;
  onUserLevelChange: (level: number) => void;
  onEnroll: () => void;
  isEnrolling: boolean;
}

export function EnrollmentDialog({
  open,
  onOpenChange,
  userLevel,
  onUserLevelChange,
  onEnroll,
  isEnrolling,
}: EnrollmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll in Course</DialogTitle>
          <DialogDescription>
            Set your skill level for this course (1-10). This helps us
            personalize your learning experience.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="userLevel">Your Skill Level (1-10)</Label>
            <Input
              id="userLevel"
              type="number"
              min="1"
              max="10"
              value={userLevel}
              onChange={(e) => onUserLevelChange(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              1-3: Beginner • 4-6: Intermediate • 7-8: Advanced • 9-10: Expert
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEnrolling}
          >
            Cancel
          </Button>
          <Button onClick={onEnroll} disabled={isEnrolling}>
            {isEnrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <GraduationCap className="mr-2 h-4 w-4" />
                Enroll
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

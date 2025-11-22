"use client";

import { useGetAllExamAttemptsByQuizSetQuery } from "@/redux/features/quiz/quiz.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Users, Clock, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExamAttemptsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizSetId: string;
  quizSetTitle?: string;
}

export function ExamAttemptsDialog({
  open,
  onOpenChange,
  quizSetId,
  quizSetTitle,
}: ExamAttemptsDialogProps) {
  const { data: attempts, isLoading } = useGetAllExamAttemptsByQuizSetQuery(
    quizSetId,
    {
      skip: !open || !quizSetId,
    }
  );

  const attemptsArray = Array.isArray(attempts) ? attempts : [];

  // Calculate statistics
  const totalAttempts = attemptsArray.length;
  const averageScore =
    totalAttempts > 0
      ? attemptsArray.reduce((sum, a) => sum + a.score, 0) / totalAttempts
      : 0;
  const averagePercentage =
    totalAttempts > 0
      ? attemptsArray.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
      : 0;
  const bestScore =
    totalAttempts > 0 ? Math.max(...attemptsArray.map((a) => a.score)) : 0;
  const bestScoreTotal =
    totalAttempts > 0 ? attemptsArray[0]?.totalMarks || 0 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="custom-dialog-width max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Exam Attempts
            {quizSetTitle && (
              <span className="text-base font-normal text-muted-foreground">
                - {quizSetTitle}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            View all exam attempts for this quiz set
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : attemptsArray.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No exam attempts found
            </h3>
            <p className="text-muted-foreground">
              No students have taken this exam yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Total Attempts
                </div>
                <div className="text-2xl font-bold">{totalAttempts}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Average Score
                </div>
                <div className="text-2xl font-bold">
                  {averageScore.toFixed(1)} / {bestScoreTotal}
                </div>
                <div className="text-xs text-muted-foreground">
                  {averagePercentage.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Best Score
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {bestScore} / {bestScoreTotal}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Completion Rate
                </div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-xs text-muted-foreground">
                  All completed
                </div>
              </div>
            </div>

            {/* Attempts List */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground px-2">
                All Attempts ({totalAttempts})
              </div>
              <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto">
                {attemptsArray.map((attempt) => {
                  const user =
                    typeof attempt.user === "object" && attempt.user
                      ? attempt.user
                      : null;
                  const quizSet =
                    typeof attempt.quizSet === "object" && attempt.quizSet
                      ? attempt.quizSet
                      : null;

                  // Calculate time taken
                  const startTime = new Date(attempt.startedAt).getTime();
                  const submitTime = attempt.submittedAt
                    ? new Date(attempt.submittedAt).getTime()
                    : Date.now();
                  const timeTakenMinutes = Math.round(
                    (submitTime - startTime) / (1000 * 60)
                  );

                  const getScoreColor = (percentage: number) => {
                    if (percentage >= 80) return "text-green-600";
                    if (percentage >= 60) return "text-blue-600";
                    if (percentage >= 40) return "text-orange-600";
                    return "text-red-600";
                  };

                  return (
                    <div
                      key={attempt._id}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Student Info */}
                        <div className="md:col-span-2">
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Student
                          </div>
                          <div className="font-semibold">
                            {user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user?.email || ""}
                          </div>
                          {user?.phone && (
                            <div className="text-xs text-muted-foreground">
                              {user.phone}
                            </div>
                          )}
                        </div>

                        {/* Score */}
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Score
                          </div>
                          <div
                            className={`font-bold text-lg ${getScoreColor(
                              attempt.percentage
                            )}`}
                          >
                            {attempt.score} / {attempt.totalMarks}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {attempt.percentage.toFixed(1)}%
                          </div>
                        </div>

                        {/* Time */}
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Time
                          </div>
                          <div className="font-medium">
                            {timeTakenMinutes} min
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Duration: {attempt.duration} min
                          </div>
                          {timeTakenMinutes > attempt.duration && (
                            <Badge
                              variant="destructive"
                              className="text-xs mt-1"
                            >
                              Overtime
                            </Badge>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Submitted
                          </div>
                          <div className="font-medium text-xs">
                            {new Date(
                              attempt.submittedAt || attempt.createdAt
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              attempt.submittedAt || attempt.createdAt
                            ).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Started:{" "}
                            {new Date(attempt.startedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

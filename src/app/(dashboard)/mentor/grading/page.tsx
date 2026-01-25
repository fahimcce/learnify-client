"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPendingGradingAttemptsQuery,
  PendingGradingAttempt,
} from "@/redux/features/quiz/quiz.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ClipboardCheck,
  Clock,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function MentorGradingPage() {
  const router = useRouter();
  const {
    data: pendingAttempts,
    isLoading,
    error,
  } = useGetPendingGradingAttemptsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">
              Failed to load pending submissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attempts = pendingAttempts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Manual Grading
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and grade short answer questions from student submissions
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-lg">
          {attempts.length} Pending
        </Badge>
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Await Manual Grading
              </p>
              <p className="text-2xl font-bold">
                {attempts.length} Submission{attempts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Attempts List */}
      {attempts.length > 0 ? (
        <div className="grid gap-4">
          {attempts.map((attempt: PendingGradingAttempt) => (
            <Card
              key={attempt._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {attempt.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{attempt.user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {attempt.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Quiz Info */}
                  <div className="flex-1 md:text-center">
                    <p className="font-medium">
                      {typeof attempt.quizSet === "object"
                        ? attempt.quizSet.title
                        : "Quiz"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {typeof attempt.quizSet === "object" &&
                      typeof attempt.quizSet.course === "object"
                        ? (attempt.quizSet.course as any).courseName
                        : "Course"}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-1">
                        {attempt.ungradedCount} Ungraded
                      </Badge>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">
                        {attempt.score}/{attempt.totalMarks}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Current Score
                      </p>
                    </div>
                  </div>

                  {/* Submitted Time & Action */}
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {format(new Date(attempt.submittedAt), "MMM dd, hh:mm a")}
                    </div>
                    <Button
                      onClick={() =>
                        router.push(`/mentor/grading/${attempt._id}`)
                      }
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Grade Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No submissions are pending manual grading. New submissions with
              short answer questions will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

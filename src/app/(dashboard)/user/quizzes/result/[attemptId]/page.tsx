"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useGetExamResultQuery,
  useGetExamReportQuery,
} from "@/redux/features/quiz/quiz.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const { data: result, isLoading: isLoadingResult } = useGetExamResultQuery(
    attemptId,
    { skip: !attemptId }
  );
  const { data: report, isLoading: isLoadingReport } = useGetExamReportQuery(
    attemptId,
    { skip: !attemptId }
  );

  if (isLoadingResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Exam result not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quizSet =
    typeof result.quizSet === "object" && result.quizSet
      ? result.quizSet
      : null;
  const course =
    quizSet && typeof quizSet.course === "object" && quizSet.course
      ? quizSet.course
      : null;

  const correctCount = result.answers.filter((a) => a.isCorrect).length;
  const wrongCount = result.answers.filter(
    (a) => !a.isCorrect && a.selectedAnswer !== null
  ).length;
  const unansweredCount = result.answers.filter(
    (a) => a.selectedAnswer === null
  ).length;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/user/quizzes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-muted-foreground mt-2">
            {quizSet?.title || "Quiz Results"}
          </p>
        </div>
      </div>

      {/* Score Summary - Compact */}
      <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Award className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Your Score</h2>
          </div>

          {/* Main Score */}
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${getScoreColor(
                result.percentage
              )}`}
            >
              {result.score} / {result.totalMarks}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Marks</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-md bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-green-600">
                {correctCount}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-2 rounded-md bg-red-50 dark:bg-red-950">
              <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-red-600">{wrongCount}</div>
              <div className="text-xs text-muted-foreground">Wrong</div>
            </div>
            <div className="text-center p-2 rounded-md bg-gray-50 dark:bg-gray-950">
              <FileText className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-600">
                {unansweredCount}
              </div>
              <div className="text-xs text-muted-foreground">Unanswered</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Overall Performance</span>
              <span className="font-medium">
                {result.score} / {result.totalMarks} marks
              </span>
            </div>
            <Progress value={result.percentage} className="h-1.5" />
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
            <div>
              <div className="text-muted-foreground flex items-center gap-1 mb-0.5">
                <Clock className="h-3 w-3" />
                Duration
              </div>
              <div className="font-medium">{result.duration} min</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-0.5">Submitted At</div>
              <div className="font-medium text-xs">
                {new Date(
                  result.submittedAt || result.createdAt
                ).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report - Always Visible */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
          <CardDescription>
            Question-wise breakdown with correct answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReport ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : report ? (
            <div className="space-y-6">
              {report.answers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={`p-4 rounded-lg border ${
                    answer.isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : "border-red-500 bg-red-50 dark:bg-red-950"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge variant="secondary">{answer.mark} marks</Badge>
                      {answer.isCorrect ? (
                        <Badge variant="default" className="bg-green-600">
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Wrong</Badge>
                      )}
                    </div>
                    <Badge variant="outline">
                      {answer.markObtained} / {answer.mark} marks
                    </Badge>
                  </div>

                  <p className="font-medium mb-3">{answer.question}</p>

                  <div className="space-y-2">
                    {["A", "B", "C", "D"].map((option) => {
                      const isSelected = answer.selectedAnswer === option;
                      const isCorrect = answer.rightAnswer === option;
                      return (
                        <div
                          key={option}
                          className={`p-2 rounded-md border ${
                            isCorrect
                              ? "border-green-500 bg-green-100 dark:bg-green-900"
                              : isSelected
                              ? "border-red-500 bg-red-100 dark:bg-red-900"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">
                              Option {option}:
                            </span>
                            <span>
                              {answer.options[option as "A" | "B" | "C" | "D"]}
                            </span>
                            {isCorrect && (
                              <Badge
                                variant="default"
                                className="ml-auto bg-green-600"
                              >
                                Correct Answer
                              </Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge variant="destructive" className="ml-auto">
                                Your Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No detailed report available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

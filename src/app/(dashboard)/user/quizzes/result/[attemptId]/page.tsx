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
  AlertCircle,
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

      {/* Success Indicator for Pending Grading */}
      {result.status === "grading-pending" && (
        <Card className="border-primary bg-primary/5 overflow-hidden relative border-2">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-primary font-bold">
                  Successfully Submitted!
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  Your exam has been received and is waiting for evaluation.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-primary/20 shadow-sm flex gap-4 items-start">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-orange-700 dark:text-orange-400 text-lg">
                  Manual Evaluation Required
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Notice: This quiz includes{" "}
                  <span className="font-bold text-foreground">
                    Short Answer
                  </span>{" "}
                  questions. Unlike MCQs, these must be reviewed by your{" "}
                  <span className="font-bold text-foreground">Mentor</span> to
                  ensure you receive the correct credit.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your final score, accurate percentage, and detailed feedback
                  will be visible here once your mentor completes the
                  evaluation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Summary - Compact - Always show if submitted */}
      {result.status !== "in-progress" && (
        <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Your Score</h2>
            </div>

            {/* Main Score & Grading Badge */}
            <div className="text-center">
              {result.status === "grading-pending" && (
                <div className="mb-2">
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-200 bg-orange-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Grading in Progress
                  </Badge>
                </div>
              )}
              <div
                className={`text-4xl font-bold ${getScoreColor(
                  result.percentage
                )}`}
              >
                {result.score} / {result.totalMarks}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Total Marks</p>
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
                <div className="text-xl font-bold text-red-600">
                  {wrongCount}
                </div>
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
      )}

      {/* Detailed Report - Always Visible */}
      {/* Detailed Report - Always show if submitted */}
      {result.status !== "in-progress" && (
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

                    <div className="space-y-3">
                      {/* MCQ Options Rendering */}
                      {answer.questionType === "mcq" && answer.options && (
                        <div className="space-y-2">
                          {["A", "B", "C", "D"].map((option) => {
                            const isSelected = answer.selectedAnswer === option;
                            const isCorrect = answer.rightAnswer === option;
                            return (
                              <div
                                key={option}
                                className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                                  isCorrect
                                    ? "border-green-500 bg-green-100/50 dark:bg-green-950/30"
                                    : isSelected
                                    ? "border-red-500 bg-red-100/50 dark:bg-red-950/30"
                                    : "border-border bg-background"
                                }`}
                              >
                                <div
                                  className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isCorrect
                                      ? "border-green-600 bg-green-600 text-white"
                                      : isSelected
                                      ? "border-red-600 bg-red-600 text-white"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : isSelected ? (
                                    <XCircle className="h-4 w-4" />
                                  ) : (
                                    <span className="text-xs font-bold">
                                      {option}
                                    </span>
                                  )}
                                </div>
                                <span className="flex-1 text-sm">
                                  {
                                    answer.options![
                                      option as "A" | "B" | "C" | "D"
                                    ]
                                  }
                                </span>
                                {isCorrect && (
                                  <Badge
                                    variant="default"
                                    className="bg-green-600 text-[10px] h-5"
                                  >
                                    Correct
                                  </Badge>
                                )}
                                {isSelected && !isCorrect && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px] h-5"
                                  >
                                    Your Answer
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Boolean Options Rendering */}
                      {answer.questionType === "boolean" && (
                        <div className="grid grid-cols-2 gap-3">
                          {[true, false].map((val) => {
                            const isSelected = answer.booleanAnswer === val;
                            const isCorrect = answer.booleanAnswerRight === val;
                            return (
                              <div
                                key={val.toString()}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                  isCorrect
                                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : isSelected
                                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                    : "border-border opacity-60"
                                }`}
                              >
                                {val ? (
                                  <CheckCircle2
                                    className={`h-6 w-6 ${
                                      isCorrect
                                        ? "text-green-600"
                                        : isSelected
                                        ? "text-red-600"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ) : (
                                  <XCircle
                                    className={`h-6 w-6 ${
                                      isCorrect
                                        ? "text-green-600"
                                        : isSelected
                                        ? "text-red-600"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                )}
                                <span
                                  className={`font-bold uppercase tracking-wider ${
                                    isCorrect
                                      ? "text-green-700"
                                      : isSelected
                                      ? "text-red-700"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {val ? "True" : "False"}
                                </span>
                                {isCorrect && isSelected && (
                                  <Badge className="bg-green-600 text-[9px] px-1 py-0 h-4">
                                    Correct
                                  </Badge>
                                )}
                                {!isCorrect && isSelected && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[9px] px-1 py-0 h-4"
                                  >
                                    Incorrect
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Short Answer Rendering */}
                      {answer.questionType === "short_answer" && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-accent/30 border border-dashed">
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                              Your Answer:
                            </p>
                            <p className="text-sm whitespace-pre-wrap">
                              {answer.shortAnswer || (
                                <span className="italic text-muted-foreground">
                                  No answer provided
                                </span>
                              )}
                            </p>
                          </div>

                          {!answer.isGraded ? (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Pending Mentor Evaluation
                              </span>
                            </div>
                          ) : (
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                              <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase mb-2">
                                Mentor Feedback:
                              </p>
                              <p className="text-sm italic">
                                {answer.feedback || "No feedback provided."}
                              </p>
                              <div className="mt-3 flex items-center justify-between border-t border-green-200 dark:border-green-900 pt-2">
                                <span className="text-xs text-muted-foreground">
                                  Expected: {answer.expectedAnswer}
                                </span>
                                <Badge className="bg-green-600">
                                  {answer.markObtained} marks
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
      )}
    </div>
  );
}

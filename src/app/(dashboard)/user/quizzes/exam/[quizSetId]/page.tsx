"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useStartExamMutation,
  useSubmitExamMutation,
  StartExamResponse,
  QuestionWithoutAnswer,
} from "@/redux/features/quiz/quiz.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizSetId = params.quizSetId as string;
  const attemptIdFromUrl = searchParams.get("attemptId");

  const [examData, setExamData] = useState<StartExamResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const [startExam, { isLoading: isStarting }] = useStartExamMutation();
  const [submitExam, { isLoading: isSubmittingMutation }] =
    useSubmitExamMutation();

  // Load exam data
  useEffect(() => {
    const loadExam = async () => {
      try {
        const result = await startExam(quizSetId).unwrap();
        setExamData(result);
        setTimeRemaining(result.quizSet.duration * 60); // Convert minutes to seconds
        startTimeRef.current = new Date(result.startedAt);

        // Initialize answers
        const initialAnswers: Record<string, any> = {};
        result.questions.forEach((q) => {
          if (q.type === "mcq") initialAnswers[q._id] = null;
          else if (q.type === "boolean") initialAnswers[q._id] = null;
          else if (q.type === "short_answer") initialAnswers[q._id] = "";
        });
        setAnswers(initialAnswers);
      } catch (error: any) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to start exam. Please try again.";
        toast.error(errorMessage);
        router.push("/user/quizzes");
      }
    };

    if (quizSetId) {
      loadExam();
    }
  }, [quizSetId]);

  // Timer effect - start timer when exam loads
  useEffect(() => {
    if (examData && timeRemaining > 0 && !isSubmitting && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto submit when time runs out
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examData]);

  // Warn user before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examData && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examData, isSubmitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting || !examData) return;

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsSubmitting(true);

    try {
      const answersArray = examData.questions.map((q) => {
        const answer: any = { questionId: q._id };
        const type = q.type || ((q as any).options ? "mcq" : "short_answer");

        if (type === "mcq") answer.selectedAnswer = answers[q._id];
        else if (type === "boolean") answer.booleanAnswer = answers[q._id];
        else if (type === "short_answer") answer.shortAnswer = answers[q._id];

        return answer;
      });

      const result = await submitExam({
        quizSetId: quizSetId,
        answers: answersArray,
      }).unwrap();

      toast.success("Exam submitted automatically (time expired)!");
      router.push(`/user/quizzes/result/${result._id}`);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to submit exam. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!examData) return;

    const answeredCount = Object.values(answers).filter(
      (a) => a !== null
    ).length;
    const totalQuestions = examData.questions.length;
    const unansweredCount = totalQuestions - answeredCount;

    if (unansweredCount > 0) {
      setShowSubmitDialog(true);
    } else {
      await submitExamNow();
    }
  };

  const submitExamNow = async () => {
    if (isSubmitting || !examData) return;
    setIsSubmitting(true);
    setShowSubmitDialog(false);

    try {
      const answersArray = examData.questions.map((q) => {
        const answer: any = { questionId: q._id };

        // Use type-aware answer mapping
        const type = q.type || ((q as any).options ? "mcq" : "short_answer");

        if (type === "mcq") {
          answer.selectedAnswer = answers[q._id] || null;
        } else if (type === "boolean") {
          answer.booleanAnswer = answers[q._id] ?? null;
        } else if (type === "short_answer") {
          answer.shortAnswer = answers[q._id] || "";
        }

        return answer;
      });

      const result = await submitExam({
        quizSetId: quizSetId,
        answers: answersArray,
      }).unwrap();

      toast.success("Exam submitted successfully!");
      router.push(`/user/quizzes/result/${result._id}`);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to submit exam. Please try again.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter((a) => a !== null).length;
  };

  if (isStarting || !examData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const course =
    typeof examData.quizSet.course === "object" && examData.quizSet.course
      ? examData.quizSet.course
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="sticky top-4 z-10 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {examData.quizSet.title}
              </CardTitle>
              {course && (
                <p className="text-sm text-muted-foreground mt-1">
                  {course.courseName} ({course.courseCode})
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-lg font-semibold">
                  {getAnsweredCount()} / {examData.questions.length}
                </div>
              </div>
              <Button
                onClick={handleManualSubmit}
                disabled={isSubmitting || isSubmittingMutation}
                size="lg"
                className="min-w-[200px]"
              >
                {isSubmitting || isSubmittingMutation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Exam
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {examData.questions.map((question, index) => (
          <Card
            key={question._id}
            className="transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    Question {index + 1}
                  </CardTitle>
                  {answers[question._id] !== null &&
                  answers[question._id] !== "" ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Answered
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-orange-500 border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                    >
                      Not Answered
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="font-bold">
                  {question.mark} Marks
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-base font-medium">{question.question}</p>

                {/* MCQ Options */}
                {(question.type === "mcq" ||
                  (!question.type && question.options)) &&
                  question.options && (
                    <div className="space-y-3">
                      {["A", "B", "C", "D"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            handleAnswerChange(question._id, option)
                          }
                          className={`w-full text-left flex items-center space-x-3 p-4 rounded-md border transition-colors ${
                            answers[question._id] === option
                              ? "border-primary bg-primary/10 hover:bg-primary/15"
                              : "border-border hover:border-primary/50 hover:bg-accent"
                          }`}
                        >
                          <div
                            className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              answers[question._id] === option
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {answers[question._id] === option && (
                              <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium mr-2">
                              Option {option}:
                            </span>
                            <span>
                              {
                                question.options![
                                  option as "A" | "B" | "C" | "D"
                                ]
                              }
                            </span>
                          </div>
                          {answers[question._id] === option && (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                {/* Boolean Answer */}
                {question.type === "boolean" && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question._id, true)}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                        answers[question._id] === true
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border hover:border-green-200"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-8 w-8 mb-2 ${
                          answers[question._id] === true
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`font-bold text-lg ${
                          answers[question._id] === true
                            ? "text-green-700 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        TRUE
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question._id, false)}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                        answers[question._id] === false
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-border hover:border-red-200"
                      }`}
                    >
                      <XCircle
                        className={`h-8 w-8 mb-2 ${
                          answers[question._id] === false
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`font-bold text-lg ${
                          answers[question._id] === false
                            ? "text-red-700 dark:text-red-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        FALSE
                      </span>
                    </button>
                  </div>
                )}

                {/* Short Answer (Fallback) */}
                {(question.type === "short_answer" ||
                  (!question.type && !question.options)) && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Your Answer:
                    </Label>
                    <Textarea
                      placeholder="Type your answer here..."
                      className="min-h-[120px] resize-none focus-visible:ring-primary"
                      value={answers[question._id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                    />
                    <p className="text-[11px] text-muted-foreground italic">
                      Tip: Provide a clear and concise answer.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unanswered Questions Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground text-center">
            {examData.questions.length - getAnsweredCount()} question(s)
            unanswered
          </div>
        </CardContent>
      </Card>

      {/* Fixed Timer - Top Center - Eye-catching Design */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-auto">
        <div
          className={`relative overflow-hidden rounded-2xl px-5 py-2.5 shadow-2xl backdrop-blur-md border-2 transition-all duration-300 ${
            timeRemaining < 300
              ? "bg-linear-to-br from-red-500/95 via-red-600/95 to-red-700/95 border-red-400/50 animate-pulse"
              : timeRemaining < 600
              ? "bg-linear-to-br from-orange-500/95 via-orange-600/95 to-orange-700/95 border-orange-400/50"
              : "bg-linear-to-br from-primary/95 via-primary/90 to-primary/85 border-primary/40"
          }`}
        >
          {/* Animated background glow */}
          <div
            className={`absolute inset-0 opacity-20 ${
              timeRemaining < 300
                ? "bg-red-400 animate-ping"
                : timeRemaining < 600
                ? "bg-orange-400"
                : "bg-primary"
            }`}
            style={{
              animation:
                timeRemaining < 300
                  ? "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite"
                  : "none",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center min-w-[120px]">
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="flex items-center gap-2">
                <Clock
                  className={`h-4 w-4 ${
                    timeRemaining < 300
                      ? "text-white animate-spin"
                      : "text-white"
                  }`}
                  style={{
                    animation:
                      timeRemaining < 300
                        ? "spin 1.5s linear infinite"
                        : "none",
                  }}
                />
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">
                  {timeRemaining < 300 ? "Time Critical" : "Time Remaining"}
                </span>
              </div>
              <div
                className={`text-2xl font-black text-white drop-shadow-md ${
                  timeRemaining < 300 ? "scale-110 transition-transform" : ""
                }`}
                style={{
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                  fontFamily: "monospace",
                }}
              >
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress bar indicator */}
            {examData && (
              <div className="mt-2 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeRemaining < 300
                      ? "bg-white animate-pulse"
                      : "bg-white/90"
                  }`}
                  style={{
                    width: `${
                      (timeRemaining / (examData.quizSet.duration * 60)) * 100
                    }%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-white/5 rounded-tr-full" />
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Confirm Submission
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have {examData.questions.length - getAnsweredCount()}{" "}
              unanswered question(s). Are you sure you want to submit the exam?
              You cannot change your answers after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting || isSubmittingMutation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={submitExamNow}
              disabled={isSubmitting || isSubmittingMutation}
              className="bg-primary"
            >
              {isSubmitting || isSubmittingMutation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Anyway"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

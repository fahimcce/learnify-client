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
import { Loader2, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizSetId = params.quizSetId as string;
  const attemptIdFromUrl = searchParams.get("attemptId");

  const [examData, setExamData] = useState<StartExamResponse | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, "A" | "B" | "C" | "D" | null>
  >({});
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
        const initialAnswers: Record<string, "A" | "B" | "C" | "D" | null> = {};
        result.questions.forEach((q) => {
          initialAnswers[q._id] = null;
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

  const handleAnswerChange = (
    questionId: string,
    answer: "A" | "B" | "C" | "D"
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
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
      const answersArray = examData.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || null,
      }));

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
      const answersArray = examData.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || null,
      }));

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
          <Card key={question._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  Question {index + 1} of {examData.questions.length}
                </CardTitle>
                <Badge variant="outline">{question.mark} marks</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-base font-medium">{question.question}</p>

                <div className="space-y-3">
                  {["A", "B", "C", "D"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        handleAnswerChange(
                          question._id,
                          option as "A" | "B" | "C" | "D"
                        )
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
                          {question.options[option as "A" | "B" | "C" | "D"]}
                        </span>
                      </div>
                      {answers[question._id] === option && (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
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

      {/* Fixed Timer - Bottom Right - Eye-catching Design (Compact) */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`relative overflow-hidden rounded-xl p-3 shadow-2xl backdrop-blur-sm border-2 transition-all duration-300 ${
            timeRemaining < 300
              ? "bg-linear-to-br from-red-500 via-red-600 to-red-700 border-red-400 animate-pulse"
              : timeRemaining < 600
              ? "bg-linear-to-br from-orange-500 via-orange-600 to-orange-700 border-orange-400"
              : "bg-linear-to-br from-primary via-primary/90 to-primary/80 border-primary/50"
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
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock
                className={`h-3.5 w-3.5 ${
                  timeRemaining < 300
                    ? "text-white animate-spin"
                    : timeRemaining < 600
                    ? "text-white"
                    : "text-white"
                }`}
                style={{
                  animation:
                    timeRemaining < 300 ? "spin 1s linear infinite" : "none",
                }}
              />
              <span className="text-[10px] font-semibold text-white/90 uppercase tracking-wider">
                Time
              </span>
            </div>
            <div
              className={`text-2xl font-black text-white drop-shadow-lg ${
                timeRemaining < 300 ? "animate-pulse" : ""
              }`}
              style={{
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              {formatTime(timeRemaining)}
            </div>

            {/* Progress bar indicator */}
            {examData && (
              <div className="mt-1.5 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeRemaining < 300
                      ? "bg-white animate-pulse"
                      : timeRemaining < 600
                      ? "bg-white"
                      : "bg-white/80"
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
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/5 rounded-tr-full" />
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

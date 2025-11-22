"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useGetCourseByIdQuery } from "@/redux/features/course/course.api";
import {
  useGetAvailableQuizSetsQuery,
  useStartExamMutation,
  QuizSet,
} from "@/redux/features/quiz/quiz.api";
import { useGetExamHistoryQuery } from "@/redux/features/quiz/quiz.api";
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
  BookOpen,
  ClipboardList,
  Clock,
  FileQuestion,
  Play,
  History,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CourseQuizSetsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { data: course, isLoading: isLoadingCourse } = useGetCourseByIdQuery(
    courseId,
    { skip: !courseId }
  );
  const { data: quizSets, isLoading: isLoadingQuizSets } =
    useGetAvailableQuizSetsQuery({ course: courseId });
  const { data: examHistory } = useGetExamHistoryQuery({ course: courseId });
  const [startExam, { isLoading: isStarting }] = useStartExamMutation();

  // Get attempt counts for each quiz set
  const examHistoryArray = Array.isArray(examHistory) ? examHistory : [];
  const quizSetsArray = Array.isArray(quizSets) ? quizSets : [];

  const quizSetsWithAttempts = quizSetsArray.map((quizSet) => {
    const attempts = examHistoryArray.filter(
      (attempt) =>
        (typeof attempt.quizSet === "string"
          ? attempt.quizSet
          : attempt.quizSet?._id) === quizSet._id
    );
    const bestAttempt =
      attempts.length > 0
        ? attempts.reduce((best, current) =>
            current.score > best.score ? current : best
          )
        : null;
    const lastAttempt =
      attempts.length > 0
        ? attempts.sort(
            (a, b) =>
              new Date(b.submittedAt || b.createdAt).getTime() -
              new Date(a.submittedAt || a.createdAt).getTime()
          )[0]
        : null;

    return {
      ...quizSet,
      attemptCount: attempts.length,
      bestAttempt,
      lastAttempt,
    };
  });

  const handleStartQuiz = async (quizSetId: string) => {
    try {
      const result = await startExam(quizSetId).unwrap();
      router.push(
        `/user/quizzes/exam/${quizSetId}?attemptId=${result.attemptId}`
      );
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to start exam. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoadingCourse || isLoadingQuizSets) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || quizSetsArray.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              {!course
                ? "Course not found"
                : "No quiz sets available for this course"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            {course.courseName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Available Quiz Sets - {course.courseCode}
          </p>
        </div>
      </div>

      {/* Quiz Sets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizSetsWithAttempts.map((quizSet) => (
          <motion.div
            key={quizSet._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{quizSet.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Quiz Set for {course.courseName}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duration:
                      </span>
                      <p className="font-medium">{quizSet.duration} min</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <FileQuestion className="h-3 w-3" />
                        Total Marks:
                      </span>
                      <p className="font-medium">{quizSet.totalMarks}</p>
                    </div>
                  </div>

                  {quizSet.questionCount !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Questions: </span>
                      <span className="font-medium">
                        {quizSet.questionCount}
                      </span>
                    </div>
                  )}

                  {/* Attempt Info */}
                  {quizSet.attemptCount > 0 && (
                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <History className="h-3 w-3" />
                          Attempts:
                        </span>
                        <Badge variant="secondary">
                          {quizSet.attemptCount}
                        </Badge>
                      </div>
                      {quizSet.bestAttempt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Best Score:
                          </span>
                          <Badge variant="default">
                            {quizSet.bestAttempt.score} /{" "}
                            {quizSet.bestAttempt.totalMarks}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => handleStartQuiz(quizSet._id)}
                      disabled={isStarting}
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(
                          `/user/quizzes/history?course=${courseId}&quizSet=${quizSet._id}`
                        )
                      }
                    >
                      <History className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

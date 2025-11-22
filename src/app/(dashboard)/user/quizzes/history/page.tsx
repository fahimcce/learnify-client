"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetExamHistoryQuery,
  ExamAttempt,
} from "@/redux/features/quiz/quiz.api";
import { useGetMyEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  History,
  Search,
  X,
  Award,
  Clock,
  Calendar,
  Eye,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExamHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [quizSetFilter, setQuizSetFilter] = useState<string>("all");

  // Initialize filters from URL params
  useEffect(() => {
    const courseParam = searchParams.get("course");
    const quizSetParam = searchParams.get("quizSet");
    if (courseParam) {
      setCourseFilter(courseParam);
    }
    if (quizSetParam) {
      setQuizSetFilter(quizSetParam);
    }
  }, [searchParams]);

  const { data: examHistory, isLoading: isLoadingHistory } =
    useGetExamHistoryQuery();
  const { data: enrollments } = useGetMyEnrollmentsQuery();

  // Get courses for filter
  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
  const courses = enrollmentsArray
    .filter((e) => !e.isDeleted)
    .map((e) => e.courseId);

  // Filter exam history
  const examHistoryArray = Array.isArray(examHistory) ? examHistory : [];
  const filteredHistory = examHistoryArray.filter((attempt) => {
    const quizSet =
      typeof attempt.quizSet === "object" && attempt.quizSet
        ? attempt.quizSet
        : null;
    const course =
      quizSet && typeof quizSet.course === "object" && quizSet.course
        ? quizSet.course
        : null;
    const quizSetId =
      typeof attempt.quizSet === "string"
        ? attempt.quizSet
        : attempt.quizSet?._id;

    const matchesSearch =
      !searchTerm ||
      quizSet?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course?.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course?.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse =
      courseFilter === "all" || (course && course._id === courseFilter);

    const matchesQuizSet =
      quizSetFilter === "all" || quizSetId === quizSetFilter;

    return matchesSearch && matchesCourse && matchesQuizSet;
  });

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

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam History</h1>
          <p className="text-muted-foreground mt-2">
            View all your previous exam attempts and performance
          </p>
        </div>
        <Button onClick={() => router.push("/user/quizzes")} variant="outline">
          <BookOpen className="mr-2 h-4 w-4" />
          Take New Quiz
        </Button>
      </div>

      {/* Statistics */}
      {examHistoryArray.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {examHistoryArray.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  examHistoryArray.reduce((sum, a) => sum + a.percentage, 0) /
                  examHistoryArray.length
                ).toFixed(1)}
                %
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Best Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.max(...examHistoryArray.map((a) => a.percentage)).toFixed(
                  1
                )}
                %
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unique Quiz Sets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(
                    examHistoryArray.map((a) =>
                      typeof a.quizSet === "string" ? a.quizSet : a.quizSet?._id
                    )
                  ).size
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exam History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((attempt) => {
            const quizSet =
              typeof attempt.quizSet === "object" && attempt.quizSet
                ? attempt.quizSet
                : null;
            const course =
              quizSet && typeof quizSet.course === "object" && quizSet.course
                ? quizSet.course
                : null;

            return (
              <motion.div
                key={attempt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/user/quizzes/result/${attempt._id}`)
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {quizSet?.title || "Quiz"}
                        </CardTitle>
                        {course && (
                          <CardDescription className="mt-1">
                            {course.courseName} ({course.courseCode})
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        variant={getScoreBadgeVariant(attempt.percentage)}
                        className="text-lg px-3 py-1"
                      >
                        {attempt.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Score
                        </div>
                        <div className="font-medium">
                          {attempt.score} / {attempt.totalMarks}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration
                        </div>
                        <div className="font-medium">
                          {attempt.duration} min
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Submitted
                        </div>
                        <div className="font-medium text-sm">
                          {new Date(
                            attempt.submittedAt || attempt.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/quizzes/result/${attempt._id}`);
                          }}
                          className="w-full"
                        >
                          <Eye className="mr-2 h-3 w-3" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No exam history found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || courseFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't taken any exams yet. Start by taking a quiz!"}
              </p>
              {!searchTerm && courseFilter === "all" && (
                <Button onClick={() => router.push("/user/quizzes")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Take a Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

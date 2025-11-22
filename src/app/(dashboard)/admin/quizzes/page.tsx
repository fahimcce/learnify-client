"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { useGetAllQuizSetsQuery } from "@/redux/features/quiz/quiz.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Loader2,
  BookOpen,
  ClipboardList,
  X,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminQuizzesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: courses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useGetAllCoursesQuery();
  const { data: quizSets, isLoading: isLoadingQuizSets } =
    useGetAllQuizSetsQuery();

  // Calculate quiz set count per course
  const quizSetsArray = Array.isArray(quizSets) ? quizSets : [];
  const coursesArray = Array.isArray(courses) ? courses : [];

  const coursesWithQuizCount = coursesArray
    .filter((course) => !course.isDeleted)
    .map((course) => {
      const quizCount = quizSetsArray.filter((quizSet) => {
        const courseId =
          typeof quizSet.course === "string"
            ? quizSet.course
            : quizSet.course?._id;
        return courseId === course._id && !quizSet.isDeleted;
      }).length;
      return {
        ...course,
        quizCount,
      };
    });

  // Filter courses
  const filteredCourses = coursesWithQuizCount.filter((course) => {
    return (
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCourseClick = (courseId: string) => {
    router.push(`/admin/quizzes/course/${courseId}`);
  };

  if (isLoadingCourses || isLoadingQuizSets) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load courses. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground mt-2">
            Select a course to manage its quiz sets
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary"
                onClick={() => handleCourseClick(course._id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {course.courseName}
                      </CardTitle>
                      <CardDescription className="mt-1 font-mono">
                        {course.courseCode}
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Quiz Sets:
                      </span>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {course.quizCount}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course._id);
                        }}
                      >
                        View Quiz Sets
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : "No courses available. Create a course first to add quiz sets."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

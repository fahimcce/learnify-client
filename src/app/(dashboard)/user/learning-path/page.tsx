"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetMyEnrollmentsQuery,
  Enrollment,
} from "@/redux/features/enrollment/enrollment.api";
import {
  useGetMyLearningPathsQuery,
  useGenerateLearningPathMutation,
  useRegenerateLearningPathMutation,
  LearningPath,
} from "@/redux/features/learningPath/learningPath.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  FileText,
  GraduationCap,
  History,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function MyLearningPathsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<LearningPath | null>(null);

  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useGetMyEnrollmentsQuery();
  const { data: learningPaths, isLoading: isLoadingPaths } =
    useGetMyLearningPathsQuery();
  const [generateLearningPath, { isLoading: isGeneratingPath }] =
    useGenerateLearningPathMutation();
  const [regenerateLearningPath, { isLoading: isRegeneratingPath }] =
    useRegenerateLearningPathMutation();

  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
  const validEnrollments = enrollmentsArray.filter(
    (enrollment) => enrollment.courseId && enrollment.courseId._id
  );

  // Get learning paths for selected course
  const coursePaths =
    selectedCourseCode && Array.isArray(learningPaths)
      ? learningPaths.filter(
          (path) =>
            path.courseId?._id === selectedCourseId &&
            !path.isDeleted &&
            path.courseId?.courseCode === selectedCourseCode
        )
      : [];

  // Get selected course details
  const selectedCourse = validEnrollments.find(
    (e) => e.courseId?._id === selectedCourseId
  );

  const handleCourseSelect = (courseId: string, courseCode: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseCode(courseCode);
    setGeneratedPath(null);
    setIsGenerating(false);
  };

  const handleGeneratePath = async () => {
    if (!selectedCourseCode) return;

    setIsGenerating(true);
    setGeneratedPath(null);

    try {
      const result = await generateLearningPath({
        courseCode: selectedCourseCode,
      }).unwrap();
      setGeneratedPath(result);
      setIsGenerating(false);
      toast.success("Learning path generated successfully!");
    } catch (error: any) {
      setIsGenerating(false);
      toast.error(
        error?.data?.message ||
          "Failed to generate learning path. Please try again."
      );
    }
  };

  const handleRegeneratePath = async () => {
    if (!selectedCourseCode || !generatedPath) return;

    setIsGenerating(true);
    setGeneratedPath(null);

    try {
      const result = await regenerateLearningPath({
        courseCode: selectedCourseCode,
        previousPathId: generatedPath._id,
      }).unwrap();
      setGeneratedPath(result);
      setIsGenerating(false);
      toast.success("New learning path generated successfully!");
    } catch (error: any) {
      setIsGenerating(false);
      toast.error(
        error?.data?.message ||
          "Failed to regenerate learning path. Please try again."
      );
    }
  };

  const handleViewPath = (pathId: string) => {
    // Navigate to path detail view
    window.location.href = `/user/courses/${selectedCourseId}/learning-path?pathId=${pathId}`;
  };

  if (isLoadingEnrollments) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Step 1: Show course selection
  if (!selectedCourseId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Select Your Course
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose a course to generate an AI-powered learning path
          </p>
        </div>

        {validEnrollments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validEnrollments.map((enrollment: Enrollment) => (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="h-full cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() =>
                    handleCourseSelect(
                      enrollment.courseId!._id,
                      enrollment.courseId!.courseCode
                    )
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {enrollment.courseId?.courseName || "Unknown Course"}
                        </CardTitle>
                        <CardDescription className="font-mono text-sm mt-1">
                          {enrollment.courseId?.courseCode || "N/A"}
                        </CardDescription>
                      </div>
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Enrolled Courses
                </h3>
                <p className="text-muted-foreground mb-4">
                  You need to enroll in a course first to generate a learning
                  path.
                </p>
                <Link href="/user/courses">
                  <Button>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Enroll in Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Step 2: Show course selected view with AI Learning Path button and History
  if (!isGenerating && !generatedPath) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCourseId(null);
                setSelectedCourseCode(null);
                setGeneratedPath(null);
              }}
              className="mb-2"
            >
              ← Back to Course Selection
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedCourse?.courseId?.courseName || "Learning Path"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate an AI-powered personalized learning path for this course
            </p>
          </div>
        </div>

        {/* AI Learning Path Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Learning Path
            </CardTitle>
            <CardDescription>
              Generate a personalized learning path powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGeneratePath}
              disabled={isGeneratingPath}
              size="lg"
              className="w-full"
            >
              {isGeneratingPath ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate AI Learning Path
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* History Section */}
        {coursePaths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Previous Learning Paths
              </CardTitle>
              <CardDescription>
                View your previously generated learning paths for this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursePaths.map((path: LearningPath) => (
                  <motion.div
                    key={path._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {path.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {path.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{path.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <Badge variant="outline">
                                  {path.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{path.steps?.length || 0} steps</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleViewPath(path._id)}
                          >
                            View
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Step 3: Show loading animation while generating
  if (isGenerating || isGeneratingPath || isRegeneratingPath) {
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedCourseId(null);
              setSelectedCourseCode(null);
              setGeneratedPath(null);
              setIsGenerating(false);
            }}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedCourse?.courseId?.courseName || "Learning Path"}
          </h1>
        </div>

        <Card className="min-h-[500px] flex items-center justify-center">
          <CardContent className="py-20">
            <motion.div
              className="flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Animated Chef Hat Icon */}
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-6"
              >
                <Wand2 className="h-24 w-24 text-primary" />
              </motion.div>

              {/* Cooking Animation Text */}
              <motion.h2
                className="text-3xl font-bold mb-4"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Cooking Your Path...
              </motion.h2>

              <p className="text-muted-foreground text-lg mb-6">
                Our AI is crafting a personalized learning journey just for you
              </p>

              {/* Animated Dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Show generated path
  if (generatedPath) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCourseId(null);
                setSelectedCourseCode(null);
                setGeneratedPath(null);
                setIsGenerating(false);
              }}
              className="mb-2"
            >
              ← Back to Course Selection
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {generatedPath.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              {generatedPath.description}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRegeneratePath}
            disabled={isRegeneratingPath}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Another LP
          </Button>
        </div>

        {/* Path Details */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {generatedPath.duration}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-lg">
                  {generatedPath.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {generatedPath.steps?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Path Steps */}
        {generatedPath.steps && generatedPath.steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Learning Path Steps</CardTitle>
              <CardDescription>
                Follow these steps to master the course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {generatedPath.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 pb-6 border-b last:border-0"
                  >
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {step.stepNumber || index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {step.description}
                      </p>
                      {step.estimatedTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Clock className="h-4 w-4" />
                          <span>{step.estimatedTime}</span>
                        </div>
                      )}
                      {step.learningObjectives &&
                        step.learningObjectives.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-2">
                              Learning Objectives:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {step.learningObjectives.map((obj, idx) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      {step.resources && step.resources.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((resource, idx) => (
                              <Badge key={idx} variant="secondary">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prerequisites */}
        {generatedPath.prerequisites &&
          generatedPath.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {generatedPath.prerequisites.map((prereq, idx) => (
                    <Badge key={idx} variant="outline">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Outcomes */}
        {generatedPath.outcomes && generatedPath.outcomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Learning Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {generatedPath.outcomes.map((outcome, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    {outcome}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommended Resources */}
        {generatedPath.recommendedResources &&
          generatedPath.recommendedResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {generatedPath.recommendedResources.map((resource, idx) => (
                    <Badge key={idx} variant="secondary">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleRegeneratePath}
            disabled={isRegeneratingPath}
            className="flex-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isRegeneratingPath ? "Generating..." : "Generate Another LP"}
          </Button>
          {selectedCourseId && (
            <Link
              href={`/user/courses/${selectedCourseId}/learning-path?pathId=${generatedPath._id}`}
              className="flex-1"
            >
              <Button className="w-full">
                View Full Path
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return null;
}

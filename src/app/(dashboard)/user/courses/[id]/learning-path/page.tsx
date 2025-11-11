"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  useGenerateLearningPathMutation,
  useRegenerateLearningPathMutation,
  useGetMyLearningPathsQuery,
  LearningPath,
} from "@/redux/features/learningPath/learningPath.api";
import { useGetCourseByIdQuery } from "@/redux/features/course/course.api";
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
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function LearningPathPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  const { data: course, isLoading: isLoadingCourse } =
    useGetCourseByIdQuery(courseId);
  const {
    data: learningPaths,
    isLoading: isLoadingPaths,
    refetch: refetchLearningPaths,
  } = useGetMyLearningPathsQuery();
  const [generateLearningPath, { isLoading: isGenerating }] =
    useGenerateLearningPathMutation();
  const [regenerateLearningPath, { isLoading: isRegenerating }] =
    useRegenerateLearningPathMutation();

  // Find learning path for this course
  const courseLearningPath = learningPaths?.find(
    (path: LearningPath) => path.courseId?._id === courseId && !path.isDeleted
  );

  const handleGenerate = async () => {
    if (!course) return;
    try {
      await generateLearningPath({
        courseCode: course.courseCode,
      }).unwrap();
      toast.success("Learning path generated successfully!");
      // Refetch learning paths to show the new one
      await refetchLearningPaths();
    } catch (error: any) {
      console.error("Error generating learning path:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to generate learning path. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleRegenerate = async () => {
    if (!course || !selectedPathId) return;
    try {
      await regenerateLearningPath({
        courseCode: course.courseCode,
        previousPathId: selectedPathId,
      }).unwrap();
      toast.success("Learning path regenerated successfully!");
      setShowRegenerateDialog(false);
      setSelectedPathId(null);
      // Refetch learning paths to show the updated one
      await refetchLearningPaths();
    } catch (error: any) {
      console.error("Error regenerating learning path:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to regenerate learning path. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoadingCourse || isLoadingPaths) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">
              Failed to load course.
            </p>
            <Link href="/user/courses">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/user/courses/${courseId}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered personalized learning path for {course.courseName}
        </p>
      </div>

      {!courseLearningPath ? (
        /* Generate Learning Path */
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Learning Path Found
              </h3>
              <p className="text-muted-foreground mb-4">
                Generate a personalized AI-powered learning path for this
                course. Make sure you are enrolled in the course first. This
                will create a step-by-step guide tailored to help you master{" "}
                {course.courseName}.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isLoadingPaths}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Learning Path...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Learning Path
                  </>
                )}
              </Button>
              {isGenerating && (
                <p className="text-sm text-muted-foreground mt-4">
                  This may take a few moments. Please wait...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Display Learning Path */
        <div className="space-y-6">
          {/* Learning Path Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {courseLearningPath.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {courseLearningPath.description}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPathId(courseLearningPath._id);
                    setShowRegenerateDialog(true);
                  }}
                  disabled={isRegenerating}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {courseLearningPath.duration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Difficulty</p>
                    <Badge variant="outline" className="mt-1">
                      {courseLearningPath.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Steps</p>
                    <p className="text-sm text-muted-foreground">
                      {courseLearningPath.steps.length} steps
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {courseLearningPath.prerequisites &&
            courseLearningPath.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {courseLearningPath.prerequisites.map((prereq, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground wrap-break-word"
                      >
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Learning Outcomes */}
          {courseLearningPath.outcomes &&
            courseLearningPath.outcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Learning Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {courseLearningPath.outcomes.map((outcome, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground wrap-break-word"
                      >
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Learning Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Steps</CardTitle>
              <CardDescription>
                Follow these steps to master the course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {courseLearningPath.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-l-4 border-primary pl-4 py-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{step.title}</h4>
                        <p className="text-muted-foreground mt-1">
                          {step.description}
                        </p>
                        <div className="mt-3 space-y-2">
                          {step.learningObjectives &&
                            step.learningObjectives.length > 0 && (
                              <div>
                                <p className="text-sm font-medium">
                                  Learning Objectives:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {step.learningObjectives.map((obj, idx) => (
                                    <li key={idx} className="wrap-break-word">
                                      {obj}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          {step.resources && step.resources.length > 0 && (
                            <div>
                              <p className="text-sm font-medium">Resources:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {step.resources.map((resource, idx) => (
                                  <li key={idx} className="wrap-break-word">
                                    {resource}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Estimated time: {step.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Resources */}
          {courseLearningPath.recommendedResources &&
            courseLearningPath.recommendedResources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {courseLearningPath.recommendedResources.map(
                      (resource, index) => (
                        <li
                          key={index}
                          className="text-muted-foreground wrap-break-word"
                        >
                          {resource}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {/* Regenerate Dialog */}
      <AlertDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Learning Path?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new learning path for this course. The
              previous path will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRegenerating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Regenerate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

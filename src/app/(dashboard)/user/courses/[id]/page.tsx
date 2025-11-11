"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useGetCourseByIdQuery,
  Course,
} from "@/redux/features/course/course.api";
import {
  useEnrollInCourseMutation,
  useGetMyEnrollmentsQuery,
  Enrollment,
} from "@/redux/features/enrollment/enrollment.api";
import { useGetCourseResourcesQuery } from "@/redux/features/courseResource/courseResource.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  Sparkles,
  ExternalLink,
  PlayCircle,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [userLevel, setUserLevel] = useState<number>(5);

  const { data: course, isLoading, error } = useGetCourseByIdQuery(courseId);
  const { data: enrollments } = useGetMyEnrollmentsQuery();
  const [enrollInCourse, { isLoading: isEnrolling }] =
    useEnrollInCourseMutation();

  // Check if user is enrolled
  const enrollment = enrollments?.find(
    (e: Enrollment) => e.courseId._id === courseId && !e.isDeleted
  );

  // Only fetch resources if user is enrolled
  const { data: resources } = useGetCourseResourcesQuery(
    { courseId },
    { skip: !enrollment }
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case "beginner":
        return "Perfect for those just starting out. No prior knowledge required.";
      case "intermediate":
        return "For learners with some experience. Builds on foundational knowledge.";
      case "advanced":
        return "For experienced learners. Covers complex topics and advanced techniques.";
      default:
        return "";
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <PlayCircle className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleEnroll = async () => {
    try {
      await enrollInCourse({
        courseId,
        userLevel: userLevel || undefined,
      }).unwrap();
      toast.success("Successfully enrolled in course!");
      setIsEnrollDialogOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to enroll in course. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">
              Failed to load course. The course may not exist or you may not
              have access to it.
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
      <Link href="/user/courses">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      {/* Enrollment Status Banner */}
      {enrollment && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">You are enrolled in this course</p>
                <p className="text-sm text-muted-foreground">
                  Status: {enrollment.status} • Progress: {enrollment.progress}%
                </p>
              </div>
            </div>
            <Link href={`/user/enrollments/${enrollment._id}`}>
              <Button variant="outline" size="sm">
                View Enrollment
              </Button>
            </Link>
          </div>
          {enrollment.progress > 0 && (
            <div className="mt-4">
              <Progress value={enrollment.progress} className="h-2" />
            </div>
          )}
        </motion.div>
      )}

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl">
                    {course.courseName}
                  </CardTitle>
                </div>
                <CardDescription className="font-mono text-lg mt-2">
                  {course.courseCode}
                </CardDescription>
              </div>
              <Badge className={getLevelColor(course.level)}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {getLevelDescription(course.level)}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Course Level</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {course.level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        {!enrollment ? (
          <Button
            size="lg"
            className="flex-1 min-w-[200px]"
            onClick={() => setIsEnrollDialogOpen(true)}
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            Enroll in Course
          </Button>
        ) : (
          <>
            <Link
              href={`/user/enrollments/${enrollment._id}`}
              className="flex-1 min-w-[200px]"
            >
              <Button size="lg" className="w-full">
                <GraduationCap className="mr-2 h-5 w-5" />
                Continue Learning
              </Button>
            </Link>
            <Link
              href={`/user/courses/${courseId}/learning-path`}
              className="flex-1 min-w-[200px]"
            >
              <Button variant="outline" size="lg" className="w-full">
                <Sparkles className="mr-2 h-5 w-5" />
                Learning Path
              </Button>
            </Link>
          </>
        )}
        <Link
          href={`/user/courses/${courseId}/resources`}
          className="flex-1 min-w-[200px]"
        >
          <Button variant="outline" size="lg" className="w-full">
            <FileText className="mr-2 h-5 w-5" />
            View Resources
          </Button>
        </Link>
      </motion.div>

      {/* Resources Preview */}
      {enrollment &&
        resources &&
        Array.isArray(resources) &&
        resources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Resources</CardTitle>
                    <CardDescription>
                      {resources.length} resource
                      {resources.length !== 1 ? "s" : ""} available
                    </CardDescription>
                  </div>
                  <Link href={`/user/courses/${courseId}/resources`}>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {resources.slice(0, 4).map((resource) => (
                    <div
                      key={resource._id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="text-muted-foreground">
                        {getResourceTypeIcon(resource.resourceType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{resource.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {resource.resourceType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Course</DialogTitle>
            <DialogDescription>
              Set your skill level for this course (1-10). This helps us
              personalize your learning experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userLevel">Your Skill Level (1-10)</Label>
              <Input
                id="userLevel"
                type="number"
                min="1"
                max="10"
                value={userLevel}
                onChange={(e) => setUserLevel(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                1-3: Beginner • 4-6: Intermediate • 7-8: Advanced • 9-10: Expert
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEnrollDialogOpen(false)}
              disabled={isEnrolling}
            >
              Cancel
            </Button>
            <Button onClick={handleEnroll} disabled={isEnrolling}>
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Enroll
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

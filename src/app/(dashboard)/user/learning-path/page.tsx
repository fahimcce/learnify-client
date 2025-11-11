"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  useGetMyLearningPathsQuery,
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
} from "lucide-react";

export default function MyLearningPathsPage() {
  const {
    data: learningPaths,
    isLoading,
    error,
  } = useGetMyLearningPathsQuery();
  const pathsArray = Array.isArray(learningPaths) ? learningPaths : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load learning paths. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning Paths</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered personalized learning paths for your enrolled courses
        </p>
      </div>

      {/* Learning Paths Grid */}
      {pathsArray.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pathsArray.map((path: LearningPath) => (
            <motion.div
              key={path._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{path.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {path.courseId?.courseName || "Unknown Course"}
                      </CardDescription>
                      <CardDescription className="font-mono text-xs mt-1">
                        {path.courseId?.courseCode || "N/A"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {path.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {path.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{path.difficulty}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        {path.steps?.length || 0} step
                        {path.steps?.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Prerequisites */}
                    {path.prerequisites && path.prerequisites.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1">
                          Prerequisites:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {path.prerequisites.slice(0, 2).map((prereq, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {prereq}
                            </Badge>
                          ))}
                          {path.prerequisites.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{path.prerequisites.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t mt-auto">
                      {path.courseId?._id ? (
                        <Link
                          href={`/user/courses/${path.courseId._id}/learning-path`}
                          className="w-full"
                        >
                          <Button className="w-full" variant="default">
                            View Learning Path
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Button className="w-full" variant="default" disabled>
                          View Learning Path
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
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
            <div className="text-center py-12">
              <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No learning paths found
              </h3>
              <p className="text-muted-foreground mb-4">
                Enroll in a course and generate a personalized learning path to
                get started!
              </p>
              <Link href="/user/courses">
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

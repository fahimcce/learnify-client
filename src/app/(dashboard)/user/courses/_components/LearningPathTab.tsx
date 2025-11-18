"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { LearningPath } from "@/redux/features/learningPath/learningPath.api";
import { Course } from "@/redux/features/course/course.api";

interface LearningPathTabProps {
  isLoading: boolean;
  courseLearningPath: LearningPath | undefined;
  course: Course;
  isGenerating: boolean;
  isRegenerating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function LearningPathTab({
  isLoading,
  courseLearningPath,
  course,
  isGenerating,
  isRegenerating,
  onGenerate,
  onRegenerate,
}: LearningPathTabProps) {
  // Show loading animation while generating
  if (isGenerating || isRegenerating) {
    return (
      <Card className="min-h-[500px] flex items-center justify-center">
        <CardContent className="py-20">
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated Wand Icon */}
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
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!courseLearningPath) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Learning Path Found
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate a personalized AI-powered learning path for this course.
              This will create a step-by-step guide tailored to help you master{" "}
              {course.courseName}.
            </p>
            <Button onClick={onGenerate} disabled={isGenerating} size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Learning Path
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Learning Path Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">
                {courseLearningPath.title}
              </h3>
              <p className="text-muted-foreground">
                {courseLearningPath.description}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>

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

          {/* Prerequisites */}
          {courseLearningPath.prerequisites &&
            courseLearningPath.prerequisites.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Prerequisites</h4>
                <ul className="list-disc list-inside space-y-2">
                  {courseLearningPath.prerequisites.map((prereq, index) => (
                    <li key={index} className="text-muted-foreground">
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Learning Outcomes */}
          {courseLearningPath.outcomes &&
            courseLearningPath.outcomes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Learning Outcomes</h4>
                <ul className="list-disc list-inside space-y-2">
                  {courseLearningPath.outcomes.map((outcome, index) => (
                    <li key={index} className="text-muted-foreground">
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Learning Steps */}
          <div>
            <h4 className="font-semibold mb-4">Learning Steps</h4>
            <div className="space-y-6">
              {courseLearningPath.steps.map((step, index) => (
                <div
                  key={index}
                  className="border-l-4 border-primary pl-4 py-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-lg">{step.title}</h5>
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
                                  <li key={idx}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {step.resources && step.resources.length > 0 && (
                          <div>
                            <p className="text-sm font-medium">Resources:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {step.resources.map((resource, idx) => (
                                <li key={idx}>{resource}</li>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

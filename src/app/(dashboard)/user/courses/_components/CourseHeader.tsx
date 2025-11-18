"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, Calendar } from "lucide-react";
import { Course } from "@/redux/features/course/course.api";

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
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
                <CardTitle className="text-3xl">{course.courseName}</CardTitle>
              </div>
              <CardDescription className="font-mono text-lg mt-2">
                {course.courseCode}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
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
  );
}


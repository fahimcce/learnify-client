"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetMyAssignedCoursesQuery,
  Course,
} from "@/redux/features/course/course.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, BookOpen, X, GraduationCap } from "lucide-react";
import { format } from "date-fns";

export default function MentorCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: courses, isLoading, error } = useGetMyAssignedCoursesQuery();

  const coursesArray = Array.isArray(courses) ? courses : [];
  const filteredCourses = coursesArray.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          My Assigned Courses
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage the courses assigned to you
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        {searchTerm && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course._id}
              className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/mentor/courses/${course._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        {course.courseName}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                  <CardDescription className="text-sm font-medium">
                    {course.courseCode}
                  </CardDescription>
                  <div className="flex items-center gap-2 md:gap-4">
                    <Badge
                      variant={course.isDeleted ? "destructive" : "default"}
                    >
                      {course.isDeleted ? "Inactive" : "Active"}
                    </Badge>
                    {course.createdAt && (
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        Assigned:{" "}
                        {format(new Date(course.createdAt), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No courses found" : "No courses assigned"}
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {searchTerm
                ? "Try adjusting your search terms"
                : "You don't have any courses assigned yet. Contact an administrator to get courses assigned to you."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

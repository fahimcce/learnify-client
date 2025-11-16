"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  useGetAllCoursesQuery,
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
import { Search, Loader2, BookOpen, ArrowRight, X } from "lucide-react";

export default function UserCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: courses, isLoading, error } = useGetAllCoursesQuery();

  // Filter courses (users only see active courses, filtered by backend)
  // Ensure courses is an array
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
        <h1 className="text-3xl font-bold tracking-tight">Available Courses</h1>
        <p className="text-muted-foreground mt-2">
          Browse and explore our course catalog
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find courses that match your interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
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

            {/* Clear Filters */}
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
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">
                        {course.courseName}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="font-mono text-sm">
                    {course.courseCode}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="pt-4 border-t mt-auto">
                      <Link href={`/user/courses/${course._id}`}>
                        <Button className="w-full" variant="default">
                          View Course
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
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
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : "There are no courses available at the moment"}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

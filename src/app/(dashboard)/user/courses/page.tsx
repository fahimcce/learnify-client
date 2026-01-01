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
import { Search, Loader2, BookOpen, ArrowRight, X } from "lucide-react";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard/DashboardComponents";

export default function UserCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: courses, isLoading, error } = useGetAllCoursesQuery();

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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <DashboardCard className="border-destructive">
          <div className="text-center py-8">
            <p className="text-destructive">
              Failed to load courses. Please try again.
            </p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardPageHeader
        title="Available Courses"
        description="Browse and explore our course catalog"
      />

      {/* Filters */}
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
            onClick={() => setSearchTerm("")}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <DashboardCard className="h-full flex flex-col group hover:scale-105 hover:border-primary/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {course.courseName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1 px-2 py-1 bg-muted rounded w-fit">
                        {course.courseCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1"></div>

                <div className="pt-4 border-t border-border mt-auto">
                  <Link href={`/user/courses/${course._id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white">
                      View Course
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </DashboardCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <DashboardCard>
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search"
                : "There are no courses available at the moment"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Search
              </Button>
            )}
          </div>
        </DashboardCard>
      )}
    </div>
  );
}

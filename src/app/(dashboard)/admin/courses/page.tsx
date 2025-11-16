"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetAllCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useToggleCourseStatusMutation,
  useDeleteCourseMutation,
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
import { CourseForm } from "@/components/course/CourseForm";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  Search,
  Loader2,
  BookOpen,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  const { data: courses, isLoading, error } = useGetAllCoursesQuery();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleCourseStatusMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const handleCreateCourse = async (data: any) => {
    try {
      await createCourse(data).unwrap();
      toast.success("Course created successfully!");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create course. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateCourse = async (data: any) => {
    if (!selectedCourse) return;
    try {
      await updateCourse({ id: selectedCourse._id, data }).unwrap();
      toast.success("Course updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update course. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleToggleStatus = async (course: Course) => {
    try {
      await toggleStatus(course._id).unwrap();
      toast.success(
        course.isDeleted
          ? "Course activated successfully!"
          : "Course deactivated successfully!"
      );
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update course status. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return;
    try {
      await deleteCourse(deleteCourseId).unwrap();
      toast.success("Course permanently deleted!");
      setDeleteCourseId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete course. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  // Filter courses - ensure courses is an array
  const coursesArray = Array.isArray(courses) ? courses : [];
  const filteredCourses = coursesArray.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !course.isDeleted) ||
      (statusFilter === "inactive" && course.isDeleted);
    return matchesSearch && matchesStatus;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-2">
            Manage all courses in the system
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter courses by search or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`relative ${
                  course.isDeleted ? "opacity-60 border-dashed" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {course.courseName}
                      </CardTitle>
                      <CardDescription className="mt-1 font-mono">
                        {course.courseCode}
                      </CardDescription>
                    </div>
                    {course.isDeleted && (
                      <Badge variant="secondary" className="ml-2">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <Badge
                        variant={course.isDeleted ? "secondary" : "default"}
                      >
                        {course.isDeleted ? "Inactive" : "Active"}
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(course)}
                        className="flex-1"
                        disabled={course.isDeleted}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(course)}
                        disabled={isToggling}
                        className="flex-1"
                      >
                        <Power className="mr-2 h-3 w-3" />
                        {course.isDeleted ? "Activate" : "Deactivate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteCourseId(course._id)}
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
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
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first course"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Course Dialog */}
      <CourseForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateCourse}
        isLoading={isCreating}
      />

      {/* Edit Course Dialog */}
      <CourseForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateCourse}
        initialData={selectedCourse}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCourseId}
        onOpenChange={(open) => !open && setDeleteCourseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course and all its data from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

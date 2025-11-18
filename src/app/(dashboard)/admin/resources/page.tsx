"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetCourseResourcesQuery,
  useDeleteResourceMutation,
  useHardDeleteResourceMutation,
  CourseResource,
} from "@/redux/features/courseResource/courseResource.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
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
  FileText,
  PlayCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Plus,
  ExternalLink,
  Download,
  File,
  Upload,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { ResourceForm } from "@/components/resource/ResourceForm";
import { useUploadResourceFileMutation } from "@/redux/features/courseResource/courseResource.api";

export default function AdminResourcesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [hardDeleteResourceId, setHardDeleteResourceId] = useState<
    string | null
  >(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: courses, isLoading: isLoadingCourses } =
    useGetAllCoursesQuery();
  const { data: resources, isLoading: isLoadingResources } =
    useGetCourseResourcesQuery(
      { courseId: selectedCourseId || "" },
      {
        skip: !selectedCourseId,
      }
    );
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteResourceMutation();
  const [hardDeleteResource, { isLoading: isHardDeleting }] =
    useHardDeleteResourceMutation();
  const [uploadResource, { isLoading: isUploading }] =
    useUploadResourceFileMutation();

  const resourcesArray = Array.isArray(resources) ? resources : [];
  const coursesArray = Array.isArray(courses) ? courses : [];

  const selectedCourse = coursesArray.find(
    (course) => course._id === selectedCourseId
  );

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
        return <File className="h-5 w-5" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "video":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "link":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const handleDelete = async () => {
    if (!deleteResourceId) return;
    try {
      await deleteResource(deleteResourceId).unwrap();
      toast.success("Resource deleted successfully!");
      setDeleteResourceId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete resource. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleHardDelete = async () => {
    if (!hardDeleteResourceId) return;
    try {
      await hardDeleteResource(hardDeleteResourceId).unwrap();
      toast.success("Resource permanently deleted!");
      setHardDeleteResourceId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete resource. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCreateResource = async (data: {
    courseId: string;
    title: string;
    description?: string;
    file: File;
    category?: "resource" | "question-bank";
  }) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.category) {
        formData.append("category", data.category);
      }

      await uploadResource({
        courseId: data.courseId,
        formData,
      }).unwrap();
      toast.success("Resource uploaded successfully!");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to upload resource. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Show course selection if no course is selected
  if (!selectedCourseId) {
    if (isLoadingCourses) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-2">
            Select a course to manage its resources and question banks
          </p>
        </div>

        {coursesArray.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coursesArray
              .filter((course) => !course.isDeleted)
              .map((course) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="h-full cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedCourseId(course._id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">
                            {course.courseName}
                          </CardTitle>
                          <CardDescription className="font-mono text-sm mt-1">
                            {course.courseCode}
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
                <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
                <p className="text-muted-foreground">
                  No courses are available. Please create a course first.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show resources for selected course
  return (
    <div className="space-y-6">
      {/* Header with back button and Add Resources button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedCourseId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedCourse?.courseName || "Resources"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedCourse?.courseCode || ""} - Manage resources and question
              banks
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Resources
        </Button>
      </div>

      {/* Resources Grid */}
      {isLoadingResources ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : resourcesArray.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resourcesArray.map((resource: CourseResource) => (
            <motion.div
              key={resource._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getResourceTypeIcon(resource.resourceType)}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge
                        className={getResourceTypeColor(resource.resourceType)}
                      >
                        {resource.resourceType.charAt(0).toUpperCase() +
                          resource.resourceType.slice(1)}
                      </Badge>
                      {resource.category && (
                        <Badge variant="outline" className="text-xs">
                          {resource.category === "question-bank"
                            ? "Question Bank"
                            : "Resource"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  {resource.description && (
                    <CardDescription className="mt-2">
                      {resource.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {/* File Info */}
                    {resource.fileSize && (
                      <div className="text-sm text-muted-foreground">
                        Size: {formatFileSize(resource.fileSize)}
                      </div>
                    )}

                    {/* Uploaded By */}
                    <div className="text-sm text-muted-foreground">
                      Uploaded by: {resource.uploadedBy?.name || "Unknown"}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t mt-auto space-y-2">
                      {resource.externalLink ? (
                        <a
                          href={resource.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full block"
                        >
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </Button>
                        </a>
                      ) : resource.fileUrl ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${resource.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full block"
                        >
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </a>
                      ) : null}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteResourceId(resource._id)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3 w-3" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHardDeleteResourceId(resource._id)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          Hard Delete
                        </Button>
                      </div>
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
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by uploading your first resource or question bank
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Add Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteResourceId}
        onOpenChange={(open) => !open && setDeleteResourceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the resource. The resource can be restored
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirmation Dialog */}
      <AlertDialog
        open={!!hardDeleteResourceId}
        onOpenChange={(open) => !open && setHardDeleteResourceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              resource and its file from the database and filesystem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHardDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDelete}
              disabled={isHardDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isHardDeleting ? (
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

      {/* Create Resource Dialog */}
      {coursesArray.length > 0 && (
        <ResourceForm
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateResource}
          courses={coursesArray}
          isLoading={isUploading}
          defaultCourseId={selectedCourseId || undefined}
        />
      )}
    </div>
  );
}

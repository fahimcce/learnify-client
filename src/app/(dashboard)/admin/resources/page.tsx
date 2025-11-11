"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useGetAllResourcesQuery,
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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminResourcesPage() {
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [hardDeleteResourceId, setHardDeleteResourceId] = useState<
    string | null
  >(null);

  const { data: courses } = useGetAllCoursesQuery();
  const { data: resources, isLoading } = useGetAllResourcesQuery({
    courseId: courseFilter !== "all" ? courseFilter : undefined,
    resourceType: resourceTypeFilter !== "all" ? resourceTypeFilter : undefined,
  });
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteResourceMutation();
  const [hardDeleteResource, { isLoading: isHardDeleting }] =
    useHardDeleteResourceMutation();

  const resourcesArray = Array.isArray(resources) ? resources : [];
  const coursesArray = Array.isArray(courses) ? courses : [];

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-2">
            Manage all course resources in the system
          </p>
        </div>
        <Link href="/admin/resources/upload">
          <Button className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter resources by course or resource type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Courses</option>
                {coursesArray.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Resource Type
              </label>
              <select
                value={resourceTypeFilter}
                onChange={(e) => setResourceTypeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Types</option>
                <option value="document">Documents</option>
                <option value="video">Videos</option>
                <option value="image">Images</option>
                <option value="link">Links</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {resourcesArray.length > 0 ? (
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
                    <Badge
                      className={getResourceTypeColor(resource.resourceType)}
                    >
                      {resource.resourceType.charAt(0).toUpperCase() +
                        resource.resourceType.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  {resource.description && (
                    <CardDescription className="mt-2">
                      {resource.description}
                    </CardDescription>
                  )}
                  <CardDescription className="font-mono text-xs mt-1">
                    {resource.courseId.courseCode} -{" "}
                    {resource.courseId.courseName}
                  </CardDescription>
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
                      Uploaded by: {resource.uploadedBy.name}
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
                {courseFilter !== "all" || resourceTypeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by uploading your first resource"}
              </p>
              <Link href="/admin/resources/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </Button>
              </Link>
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
    </div>
  );
}

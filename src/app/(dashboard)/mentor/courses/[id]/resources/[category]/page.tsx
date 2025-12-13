"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useGetCourseByIdQuery,
  useGetAllCoursesQuery,
} from "@/redux/features/course/course.api";
import {
  useGetCourseResourcesQuery,
  useUploadResourceFileMutation,
  useDeleteResourceMutation,
  useHardDeleteResourceMutation,
  CourseResource,
} from "@/redux/features/courseResource/courseResource.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  FolderOpen,
  ExternalLink,
  Download,
  PlayCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  File,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ResourceForm } from "@/components/resource/ResourceForm";
import { DeleteResourceDialog } from "../../_components/DeleteResourceDialog";
import { HardDeleteResourceDialog } from "../../_components/HardDeleteResourceDialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function MentorCategoryResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const category = params.category as "resource" | "question-bank";

  // Resources state
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] =
    useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [hardDeleteResourceId, setHardDeleteResourceId] = useState<
    string | null
  >(null);

  const { data: course, isLoading, error } = useGetCourseByIdQuery(courseId);
  const { data: courses } = useGetAllCoursesQuery();

  const {
    data: resources,
    isLoading: isLoadingResources,
    refetch: refetchResources,
  } = useGetCourseResourcesQuery({ courseId });

  const [uploadResource, { isLoading: isUploadingResource }] =
    useUploadResourceFileMutation();
  const [deleteResource, { isLoading: isDeletingResource }] =
    useDeleteResourceMutation();
  const [hardDeleteResource, { isLoading: isHardDeletingResource }] =
    useHardDeleteResourceMutation();

  const resourcesArray = Array.isArray(resources) ? resources : [];
  const coursesArray = Array.isArray(courses) ? courses : [];

  // Filter resources by category
  const filteredResources = resourcesArray.filter(
    (r) => r.category === category
  );

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
      if (data.description) formData.append("description", data.description);
      formData.append("category", category); // Use the current category

      await uploadResource({
        courseId: data.courseId,
        formData,
      }).unwrap();
      toast.success("Resource uploaded successfully!");
      refetchResources();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to upload resource. Please try again."
      );
      throw error;
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
        return <File className="h-5 w-5" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "link":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
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

  const handleDeleteResource = async () => {
    if (!deleteResourceId) return;
    try {
      await deleteResource(deleteResourceId).unwrap();
      toast.success("Resource deleted successfully");
      setDeleteResourceId(null);
      refetchResources();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete resource");
    }
  };

  const handleHardDeleteResource = async () => {
    if (!hardDeleteResourceId) return;
    try {
      await hardDeleteResource(hardDeleteResourceId).unwrap();
      toast.success("Resource permanently deleted");
      setHardDeleteResourceId(null);
      refetchResources();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete resource");
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
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load course. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryTitle = category === "resource" ? "Resources" : "Question Bank";

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/mentor">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/mentor/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/mentor/courses/${courseId}`}>
                {course.courseName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/mentor/courses/${courseId}`)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-semibold">{categoryTitle}</h2>
          </div>
          <Button onClick={() => setIsCreateResourceDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add {category === "resource" ? "Resource" : "Question Bank Item"}
          </Button>
        </div>

        {isLoadingResources ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource: CourseResource) => (
              <Card key={resource._id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceTypeIcon(resource.resourceType)}
                      <CardTitle className="text-lg">
                        {resource.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteResourceId(resource._id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Badge
                    className={getResourceTypeColor(resource.resourceType)}
                  >
                    {resource.resourceType}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  {resource.description && (
                    <CardDescription className="mb-2">
                      {resource.description}
                    </CardDescription>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {resource.fileSize && (
                      <span>{formatFileSize(resource.fileSize)}</span>
                    )}
                    {resource.externalLink && (
                      <a
                        href={resource.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Link
                      </a>
                    )}
                    {resource.fileUrl && (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No{" "}
                {category === "resource" ? "resources" : "question bank items"}{" "}
                yet
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Start by adding your first{" "}
                {category === "resource" ? "resource" : "question bank item"}{" "}
                for this course
              </p>
              <Button onClick={() => setIsCreateResourceDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add{" "}
                {category === "resource" ? "Resource" : "Question Bank Item"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resource Dialogs */}
      {coursesArray.length > 0 && (
        <ResourceForm
          open={isCreateResourceDialogOpen}
          onOpenChange={setIsCreateResourceDialogOpen}
          onSubmit={handleCreateResource}
          courses={coursesArray.filter((c) => !c.isDeleted)}
          defaultCourseId={courseId}
          defaultCategory={category}
          isLoading={isUploadingResource}
        />
      )}

      {/* Delete Resource Dialogs */}
      <DeleteResourceDialog
        open={!!deleteResourceId}
        onOpenChange={(open) => !open && setDeleteResourceId(null)}
        onConfirm={handleDeleteResource}
        isLoading={isDeletingResource}
      />

      <HardDeleteResourceDialog
        open={!!hardDeleteResourceId}
        onOpenChange={(open) => !open && setHardDeleteResourceId(null)}
        onConfirm={handleHardDeleteResource}
        isLoading={isHardDeletingResource}
      />
    </div>
  );
}

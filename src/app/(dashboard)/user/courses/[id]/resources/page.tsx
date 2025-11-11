"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  useGetCourseResourcesQuery,
  CourseResource,
} from "@/redux/features/courseResource/courseResource.api";
import { useGetCourseByIdQuery } from "@/redux/features/course/course.api";
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
  ArrowLeft,
  FileText,
  PlayCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Download,
  File,
} from "lucide-react";

export default function CourseResourcesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");

  const { data: course, isLoading: isLoadingCourse } =
    useGetCourseByIdQuery(courseId);
  const { data: resources, isLoading: isLoadingResources } =
    useGetCourseResourcesQuery({ courseId });

  const resourcesArray = Array.isArray(resources) ? resources : [];
  const filteredResources =
    resourceTypeFilter === "all"
      ? resourcesArray
      : resourcesArray.filter((r) => r.resourceType === resourceTypeFilter);

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

  if (isLoadingCourse || isLoadingResources) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/user/courses/${courseId}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Resources</h1>
        <p className="text-muted-foreground mt-2">
          {course?.courseName} ({course?.courseCode})
        </p>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Resources</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource: CourseResource) => (
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
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {/* File Info */}
                    {resource.fileSize && (
                      <div className="text-sm text-muted-foreground">
                        Size: {formatFileSize(resource.fileSize)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t mt-auto">
                      {resource.externalLink ? (
                        <a
                          href={resource.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button className="w-full" variant="default">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </Button>
                        </a>
                      ) : resource.fileUrl ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}${resource.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button className="w-full" variant="default">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </a>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>
                          No file available
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
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                {resourceTypeFilter !== "all"
                  ? "No resources of this type are available for this course."
                  : "No resources are available for this course yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

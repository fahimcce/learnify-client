"use client";

import React from "react";
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
  FileText,
  ExternalLink,
  PlayCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  File,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CourseResource } from "@/redux/features/courseResource/courseResource.api";

interface ResourcesTabProps {
  resources: CourseResource[];
  getResourceTypeIcon: (type: string) => React.ReactElement;
  formatFileSize: (bytes?: number) => string;
}

export function ResourcesTab({
  resources,
  getResourceTypeIcon,
  formatFileSize,
}: ResourcesTabProps) {
  // Separate resources by category
  const regularResources = resources.filter(
    (resource) => !resource.category || resource.category === "resource"
  );
  const questionBanks = resources.filter(
    (resource) => resource.category === "question-bank"
  );

  const renderResourceCard = (resource: CourseResource) => (
    <Card key={resource._id} className="h-[120px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Row 1: Icon, Title, Badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="shrink-0 text-muted-foreground">
              {getResourceTypeIcon(resource.resourceType)}
            </div>
            <CardTitle className="text-sm font-semibold line-clamp-1 truncate">
              {resource.title}
            </CardTitle>
          </div>
          <Badge
            className={cn(
              "capitalize text-xs shrink-0",
              resource.resourceType === "document"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                : resource.resourceType === "video"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                : resource.resourceType === "image"
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
            )}
          >
            {resource.resourceType}
          </Badge>
        </div>

        {/* Row 2: Description/Size and Download Button */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex-1 min-w-0">
            {resource.description ? (
              <CardDescription className="text-xs line-clamp-1 truncate">
                {resource.description}
              </CardDescription>
            ) : resource.fileSize ? (
              <CardDescription className="text-xs">
                Size: {formatFileSize(resource.fileSize)}
              </CardDescription>
            ) : null}
          </div>
          {resource.externalLink ? (
            <a
              href={resource.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="outline" size="sm" className="h-8 px-3">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          ) : resource.fileUrl ? (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}${resource.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="outline" size="sm" className="h-8 px-3">
                <Download className="h-3 w-3" />
              </Button>
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left Side - Resources */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>
              {regularResources.length} resource
              {regularResources.length !== 1 ? "s" : ""} available
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {regularResources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                No resources are available for this course yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {regularResources.map(renderResourceCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Side - Question Banks */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Question Banks
            </CardTitle>
            <CardDescription>
              {questionBanks.length} question bank
              {questionBanks.length !== 1 ? "s" : ""} available
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {questionBanks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No question banks found
              </h3>
              <p className="text-muted-foreground">
                No question banks are available for this course yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {questionBanks.map(renderResourceCard)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

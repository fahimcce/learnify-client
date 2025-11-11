"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import {
  useUploadResourceFileMutation,
  useUploadMultipleResourceFilesMutation,
  useAddResourceMutation,
} from "@/redux/features/courseResource/courseResource.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowLeft,
  Upload,
  FileText,
  Link as LinkIcon,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function UploadResourcePage() {
  const router = useRouter();
  const [uploadType, setUploadType] = useState<"file" | "multiple" | "link">(
    "file"
  );
  const [courseId, setCourseId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [resourceType, setResourceType] = useState<string>("document");
  const [externalLink, setExternalLink] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const { data: courses, isLoading: isLoadingCourses } =
    useGetAllCoursesQuery();
  const [uploadFile, { isLoading: isUploadingFile }] =
    useUploadResourceFileMutation();
  const [uploadMultipleFiles, { isLoading: isUploadingMultiple }] =
    useUploadMultipleResourceFilesMutation();
  const [addResource, { isLoading: isAddingResource }] =
    useAddResourceMutation();

  const coursesArray = Array.isArray(courses) ? courses : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (uploadType === "multiple") {
        setFiles(Array.from(e.target.files));
      } else {
        setFile(e.target.files[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toast.error("Please select a course");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      if (uploadType === "link") {
        // Add external link resource
        if (!externalLink.trim()) {
          toast.error("Please enter an external link");
          return;
        }
        await addResource({
          courseId,
          data: {
            title,
            description: description || undefined,
            resourceType: resourceType as any,
            externalLink,
          },
        }).unwrap();
        toast.success("Resource added successfully!");
      } else if (uploadType === "multiple") {
        // Upload multiple files
        if (files.length === 0) {
          toast.error("Please select at least one file");
          return;
        }
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        if (title) formData.append("title", title);
        if (description) formData.append("description", description);

        await uploadMultipleFiles({
          courseId,
          formData,
        }).unwrap();
        toast.success(`${files.length} resources uploaded successfully!`);
      } else {
        // Upload single file
        if (!file) {
          toast.error("Please select a file");
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        if (description) formData.append("description", description);
        if (resourceType) formData.append("resourceType", resourceType);

        await uploadFile({
          courseId,
          formData,
        }).unwrap();
        toast.success("Resource uploaded successfully!");
      }

      // Reset form
      setCourseId("");
      setTitle("");
      setDescription("");
      setResourceType("document");
      setExternalLink("");
      setFile(null);
      setFiles([]);

      // Redirect to resources page
      setTimeout(() => {
        router.push("/admin/resources");
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to upload resource. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoadingCourses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/resources">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resource</h1>
        <p className="text-muted-foreground mt-2">
          Upload files or add external links for courses
        </p>
      </div>

      {/* Upload Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Type</CardTitle>
          <CardDescription>
            Choose how you want to add the resource
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setUploadType("file")}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                uploadType === "file"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">Single File</h3>
              <p className="text-sm text-muted-foreground">
                Upload one file at a time
              </p>
            </button>
            <button
              type="button"
              onClick={() => setUploadType("multiple")}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                uploadType === "multiple"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">Multiple Files</h3>
              <p className="text-sm text-muted-foreground">
                Upload up to 10 files at once
              </p>
            </button>
            <button
              type="button"
              onClick={() => setUploadType("link")}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                uploadType === "link"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <LinkIcon className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">External Link</h3>
              <p className="text-sm text-muted-foreground">
                Add an external link resource
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {uploadType === "link"
              ? "Add External Link"
              : uploadType === "multiple"
              ? "Upload Multiple Files"
              : "Upload Single File"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="courseId">
                Course <span className="text-destructive">*</span>
              </Label>
              <select
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Select a course</option>
                {coursesArray
                  .filter((course) => !course.isDeleted)
                  .map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter resource title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter resource description (optional)"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* Resource Type (for single file and link) */}
            {uploadType !== "multiple" && (
              <div className="space-y-2">
                <Label htmlFor="resourceType">Resource Type</Label>
                <select
                  id="resourceType"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  {uploadType === "link" && <option value="link">Link</option>}
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* External Link (for link type) */}
            {uploadType === "link" && (
              <div className="space-y-2">
                <Label htmlFor="externalLink">
                  External Link <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="externalLink"
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://example.com/resource"
                  required
                />
              </div>
            )}

            {/* File Upload (for single file) */}
            {uploadType === "file" && (
              <div className="space-y-2">
                <Label htmlFor="file">
                  File <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="ml-auto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Multiple Files Upload */}
            {uploadType === "multiple" && (
              <div className="space-y-2">
                <Label htmlFor="files">
                  Files <span className="text-destructive">*</span> (Max 10
                  files)
                </Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  required
                  className="cursor-pointer"
                />
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm flex-1">{f.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(f.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles(files.filter((_, i) => i !== index))
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                      selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={
                  isUploadingFile || isUploadingMultiple || isAddingResource
                }
                className="flex-1"
              >
                {isUploadingFile || isUploadingMultiple || isAddingResource ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadType === "link"
                      ? "Adding..."
                      : uploadType === "multiple"
                      ? "Uploading..."
                      : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadType === "link"
                      ? "Add Resource"
                      : uploadType === "multiple"
                      ? "Upload Files"
                      : "Upload File"}
                  </>
                )}
              </Button>
              <Link href="/admin/resources">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

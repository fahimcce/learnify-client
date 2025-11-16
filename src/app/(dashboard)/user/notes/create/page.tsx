"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  useCreateTextNoteMutation,
  useCreateFileNoteMutation,
} from "@/redux/features/note/note.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import { useGetMyEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
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
  StickyNote,
  FileText,
  Upload,
  X,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function CreateNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");

  const [noteType, setNoteType] = useState<"text" | "file">("text");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [courseId, setCourseId] = useState<string>(courseIdParam || "");
  const [file, setFile] = useState<File | null>(null);

  const { data: courses } = useGetAllCoursesQuery();
  const { data: enrollments } = useGetMyEnrollmentsQuery();
  const [createTextNote, { isLoading: isCreatingText }] =
    useCreateTextNoteMutation();
  const [createFileNote, { isLoading: isCreatingFile }] =
    useCreateFileNoteMutation();

  const coursesArray = Array.isArray(courses) ? courses : [];
  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];

  // Get enrolled courses only
  const enrolledCourses = coursesArray.filter((course) =>
    enrollmentsArray.some(
      (enrollment) =>
        enrollment.courseId &&
        enrollment.courseId._id === course._id &&
        !enrollment.isDeleted
    )
  );

  useEffect(() => {
    if (courseIdParam) {
      setCourseId(courseIdParam);
    }
  }, [courseIdParam]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Validate file type
      const isPDF = selectedFile.type === "application/pdf";
      const isImage = selectedFile.type.startsWith("image/");

      if (!isPDF && !isImage) {
        toast.error("Please select a PDF or image file");
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      if (!title.trim()) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      if (noteType === "text") {
        // Create text note
        await createTextNote({
          title,
          content: content || undefined,
          courseId: courseId || undefined,
        }).unwrap();
        toast.success("Text note created successfully!");
      } else {
        // Create file note
        if (!file) {
          toast.error("Please select a file");
          return;
        }
        await createFileNote({
          file,
          title,
          courseId: courseId || undefined,
        }).unwrap();
        toast.success("File note created successfully!");
      }

      // Redirect based on courseId
      if (courseId) {
        router.push(`/user/notes/course/${courseId}`);
      } else {
        router.push("/user/notes/random");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create note. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={courseId ? `/user/notes/course/${courseId}` : "/user/notes"}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Note</h1>
        <p className="text-muted-foreground mt-2">
          Create a new text note or upload a file note
        </p>
      </div>

      {/* Note Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Note Type</CardTitle>
          <CardDescription>
            Choose how you want to create the note
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setNoteType("text")}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                noteType === "text"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <StickyNote className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">Text Note</h3>
              <p className="text-sm text-muted-foreground">
                Create a text-based note with title and content
              </p>
            </button>
            <button
              type="button"
              onClick={() => setNoteType("file")}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                noteType === "file"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="h-6 w-6 mb-2" />
              <h3 className="font-semibold">File Note</h3>
              <p className="text-sm text-muted-foreground">
                Upload a PDF or image file as a note
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {noteType === "text" ? "Create Text Note" : "Upload File Note"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="courseId">
                Course {courseIdParam ? "(Pre-selected)" : "(Optional)"}
              </Label>
              {courseIdParam && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-md mb-2">
                  <p className="text-sm font-medium text-primary">
                    Creating note for:{" "}
                    {enrolledCourses.find((c) => c._id === courseId)
                      ?.courseName || "Selected Course"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This note will be associated with the course. You can change
                    it below if needed.
                  </p>
                </div>
              )}
              <select
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">None (Random Note)</option>
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No enrolled courses available
                  </option>
                )}
              </select>
              <p className="text-xs text-muted-foreground">
                {courseIdParam
                  ? "This note will be saved as a course-specific note. To create a random note instead, you can clear the course selection after creating this note."
                  : "Select an enrolled course to create a course-specific note, or leave empty for a random note. You must be enrolled in a course to create course-specific notes."}
              </p>
              {enrolledCourses.length === 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> You need to enroll in a course first
                    before you can create course-specific notes. This note will
                    be saved as a random note.
                  </p>
                </div>
              )}
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
                placeholder="Enter note title"
                required
              />
            </div>

            {/* Content (for text notes) */}
            {noteType === "text" && (
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter note content (optional)"
                  rows={10}
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            )}

            {/* File Upload (for file notes) */}
            {noteType === "file" && (
              <div className="space-y-2">
                <Label htmlFor="file">
                  File <span className="text-destructive">*</span> (PDF or
                  Image, Max 10MB)
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  required
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    {file.type === "application/pdf" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    <span className="text-sm flex-1">{file.name}</span>
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

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isCreatingText || isCreatingFile}
                className="flex-1"
              >
                {isCreatingText || isCreatingFile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <StickyNote className="mr-2 h-4 w-4" />
                    Create Note
                  </>
                )}
              </Button>
              <Link
                href={
                  courseId ? `/user/notes/course/${courseId}` : "/user/notes"
                }
              >
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

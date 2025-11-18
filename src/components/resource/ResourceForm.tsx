"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { Course } from "@/redux/features/course/course.api";

interface ResourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    courseId: string;
    title: string;
    description?: string;
    file: File;
    category?: "resource" | "question-bank";
  }) => Promise<void>;
  courses: Course[];
  isLoading?: boolean;
  defaultCourseId?: string;
}

export function ResourceForm({
  open,
  onOpenChange,
  onSubmit,
  courses,
  isLoading = false,
  defaultCourseId,
}: ResourceFormProps) {
  const [courseId, setCourseId] = useState<string>(defaultCourseId || "");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<"resource" | "question-bank">(
    "resource"
  );
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setCourseId(defaultCourseId || "");
      setTitle("");
      setDescription("");
      setCategory("resource");
      setFile(null);
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, defaultCourseId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!courseId) {
      newErrors.courseId = "Course is required";
    }

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!file) {
      newErrors.file = "File is required";
    } else {
      // Validate file type - support images, PDF, PPTX, and other common files
      const allowedTypes = [
        "application/pdf", // PDF
        "application/msword", // DOC
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
        "application/vnd.ms-powerpoint", // PPT
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
        "application/vnd.ms-excel", // XLS
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
        "text/plain", // TXT
        "image/jpeg", // JPEG
        "image/jpg", // JPG
        "image/png", // PNG
        "image/gif", // GIF
        "image/webp", // WEBP
      ];

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = [
        "pdf",
        "doc",
        "docx",
        "ppt",
        "pptx",
        "xls",
        "xlsx",
        "txt",
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
      ];

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension || "")
      ) {
        newErrors.file =
          "File type not supported. Please upload images (JPG, PNG, GIF, WEBP), PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, or TXT files.";
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        newErrors.file = "File size must be less than 50MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!file) return;

    try {
      await onSubmit({
        courseId,
        title,
        description: description || undefined,
        file,
        category,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrors({ ...errors, file: "" });
    }
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "ppt":
      case "pptx":
        return "📊";
      case "xls":
      case "xlsx":
        return "📈";
      case "txt":
        return "📃";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return "🖼️";
      default:
        return "📎";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="custom-dialog-width max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>
            Upload a file resource or question bank for a course. Supported
            formats: Images (JPG, PNG, GIF, WEBP), PDF, DOC, DOCX, PPT, PPTX,
            XLS, XLSX, TXT
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Course Selection */}
            {!defaultCourseId && (
              <div className="space-y-2">
                <Label htmlFor="courseId">
                  Course <span className="text-destructive">*</span>
                </Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger
                    id="courseId"
                    className={errors.courseId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter((course) => !course.isDeleted)
                      .map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.courseName} ({course.courseCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-sm text-destructive">{errors.courseId}</p>
                )}
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory(value as "resource" | "question-bank")
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="question-bank">Question Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({ ...errors, title: "" });
                }}
                placeholder="e.g., Introduction to React"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
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

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                File <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileChange}
                className={`cursor-pointer ${
                  errors.file ? "border-destructive" : ""
                }`}
              />
              {errors.file && (
                <p className="text-sm text-destructive">{errors.file}</p>
              )}
              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                      setErrors({ ...errors, file: "" });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: Images (JPG, PNG, GIF, WEBP), PDF, DOC, DOCX,
                PPT, PPTX, XLS, XLSX, TXT (Max 50MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

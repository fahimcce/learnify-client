"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "@/redux/features/course/course.api";

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCoursePayload | UpdateCoursePayload) => Promise<void>;
  initialData?: Course | null;
  isLoading?: boolean;
}

export function CourseForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: CourseFormProps) {
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        courseName: initialData.courseName,
        courseCode: initialData.courseCode,
        level: initialData.level,
      });
    } else {
      setFormData({
        courseName: "",
        courseCode: "",
        level: "beginner",
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.courseName.trim()) {
      newErrors.courseName = "Course name is required";
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Course" : "Create New Course"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the course information below."
              : "Fill in the details to create a new course."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Course Name */}
            <div className="space-y-2">
              <Label htmlFor="courseName">
                Course Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="courseName"
                value={formData.courseName}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value })
                }
                placeholder="e.g., Introduction to React"
                className={errors.courseName ? "border-destructive" : ""}
              />
              {errors.courseName && (
                <p className="text-sm text-destructive">{errors.courseName}</p>
              )}
            </div>

            {/* Course Code */}
            <div className="space-y-2">
              <Label htmlFor="courseCode">
                Course Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="courseCode"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    courseCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., REACT101"
                className={errors.courseCode ? "border-destructive" : ""}
                maxLength={20}
              />
              {errors.courseCode && (
                <p className="text-sm text-destructive">{errors.courseCode}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Course code will be converted to uppercase automatically
              </p>
            </div>

            {/* Course Level */}
            <div className="space-y-2">
              <Label htmlFor="level">
                Course Level <span className="text-destructive">*</span>
              </Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value as
                      | "beginner"
                      | "intermediate"
                      | "advanced",
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
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
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update Course"
              ) : (
                "Create Course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

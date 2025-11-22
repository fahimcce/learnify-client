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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  QuizSet,
  CreateQuizSetPayload,
  UpdateQuizSetPayload,
} from "@/redux/features/quiz/quiz.api";
import { Course } from "@/redux/features/course/course.api";

interface QuizSetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: CreateQuizSetPayload | UpdateQuizSetPayload
  ) => Promise<void>;
  initialData?: QuizSet | null;
  courses: Course[];
  defaultCourseId?: string;
  isLoading?: boolean;
}

export function QuizSetForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  courses,
  defaultCourseId,
  isLoading = false,
}: QuizSetFormProps) {
  const [formData, setFormData] = useState({
    course: defaultCourseId || "",
    title: "",
    duration: "",
    totalMarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const courseId =
        typeof initialData.course === "string"
          ? initialData.course
          : initialData.course._id;
      setFormData({
        course: courseId,
        title: initialData.title,
        duration: initialData.duration.toString(),
        totalMarks: initialData.totalMarks.toString(),
      });
    } else {
      setFormData({
        course: defaultCourseId || "",
        title: "",
        duration: "",
        totalMarks: "",
      });
    }
    setErrors({});
  }, [initialData, open, defaultCourseId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.course.trim()) {
      newErrors.course = "Course is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    } else {
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration < 1) {
        newErrors.duration = "Duration must be at least 1 minute";
      }
    }

    if (!formData.totalMarks.trim()) {
      newErrors.totalMarks = "Total marks is required";
    } else {
      const totalMarks = parseFloat(formData.totalMarks);
      if (isNaN(totalMarks) || totalMarks < 0) {
        newErrors.totalMarks = "Total marks must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        course: formData.course,
        title: formData.title,
        duration: parseInt(formData.duration),
        totalMarks: parseFloat(formData.totalMarks),
      });
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
            {initialData ? "Edit Quiz Set" : "Create New Quiz Set"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the quiz set information below."
              : "Fill in the details to create a new quiz set."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="course">
                Course <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.course}
                onValueChange={(value) =>
                  setFormData({ ...formData, course: value })
                }
                disabled={!!defaultCourseId}
              >
                <SelectTrigger
                  className={errors.course ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName} ({course.courseCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course && (
                <p className="text-sm text-destructive">{errors.course}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., DSA Midterm Exam"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration (minutes) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 60"
                className={errors.duration ? "border-destructive" : ""}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration}</p>
              )}
            </div>

            {/* Total Marks */}
            <div className="space-y-2">
              <Label htmlFor="totalMarks">
                Total Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalMarks"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalMarks}
                onChange={(e) =>
                  setFormData({ ...formData, totalMarks: e.target.value })
                }
                placeholder="e.g., 100"
                className={errors.totalMarks ? "border-destructive" : ""}
              />
              {errors.totalMarks && (
                <p className="text-sm text-destructive">{errors.totalMarks}</p>
              )}
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
                "Update Quiz Set"
              ) : (
                "Create Quiz Set"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

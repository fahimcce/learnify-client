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
  Question,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/redux/features/quiz/quiz.api";
import { QuizSet } from "@/redux/features/quiz/quiz.api";

interface QuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: CreateQuestionPayload | UpdateQuestionPayload
  ) => Promise<void>;
  initialData?: Question | null;
  quizSets: QuizSet[];
  defaultQuizSetId?: string;
  isLoading?: boolean;
}

export function QuestionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  quizSets,
  defaultQuizSetId,
  isLoading = false,
}: QuestionFormProps) {
  const [formData, setFormData] = useState({
    quizSet: defaultQuizSetId || "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    rightAnswer: "",
    mark: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      let quizSetId = "";
      const quizSetValue = initialData.quizSet as string | QuizSet;
      if (typeof quizSetValue === "string") {
        quizSetId = quizSetValue;
      } else if (
        quizSetValue &&
        typeof quizSetValue === "object" &&
        "_id" in quizSetValue
      ) {
        quizSetId = (quizSetValue as QuizSet)._id;
      }
      setFormData({
        quizSet: quizSetId,
        question: initialData.question,
        optionA: initialData.options.A,
        optionB: initialData.options.B,
        optionC: initialData.options.C,
        optionD: initialData.options.D,
        rightAnswer: initialData.rightAnswer,
        mark: initialData.mark.toString(),
      });
    } else {
      setFormData({
        quizSet: defaultQuizSetId || "",
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        rightAnswer: "",
        mark: "",
      });
    }
    setErrors({});
  }, [initialData, open, defaultQuizSetId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.quizSet.trim()) {
      newErrors.quizSet = "Quiz Set is required";
    }

    if (!formData.question.trim()) {
      newErrors.question = "Question is required";
    }

    if (!formData.optionA.trim()) {
      newErrors.optionA = "Option A is required";
    }

    if (!formData.optionB.trim()) {
      newErrors.optionB = "Option B is required";
    }

    if (!formData.optionC.trim()) {
      newErrors.optionC = "Option C is required";
    }

    if (!formData.optionD.trim()) {
      newErrors.optionD = "Option D is required";
    }

    if (!formData.rightAnswer) {
      newErrors.rightAnswer = "Right answer is required";
    }

    if (!formData.mark.trim()) {
      newErrors.mark = "Mark is required";
    } else {
      const mark = parseFloat(formData.mark);
      if (isNaN(mark) || mark < 0) {
        newErrors.mark = "Mark must be a positive number";
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
        quizSet: formData.quizSet,
        question: formData.question,
        options: {
          A: formData.optionA,
          B: formData.optionB,
          C: formData.optionC,
          D: formData.optionD,
        },
        rightAnswer: formData.rightAnswer as "A" | "B" | "C" | "D",
        mark: parseFloat(formData.mark),
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Question" : "Create New Question"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the question information below."
              : "Fill in the details to create a new question."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Quiz Set Selection */}
            <div className="space-y-2">
              <Label htmlFor="quizSet">
                Quiz Set <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.quizSet}
                onValueChange={(value) =>
                  setFormData({ ...formData, quizSet: value })
                }
                disabled={!!defaultQuizSetId}
              >
                <SelectTrigger
                  className={errors.quizSet ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select a quiz set" />
                </SelectTrigger>
                <SelectContent>
                  {quizSets.map((quizSet) => (
                    <SelectItem key={quizSet._id} value={quizSet._id}>
                      {typeof quizSet.course === "object" && quizSet.course
                        ? `${quizSet.title} - ${quizSet.course.courseName}`
                        : quizSet.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.quizSet && (
                <p className="text-sm text-destructive">{errors.quizSet}</p>
              )}
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">
                Question <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter the question..."
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.question ? "border-destructive" : ""
                }`}
                rows={3}
              />
              {errors.question && (
                <p className="text-sm text-destructive">{errors.question}</p>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optionA">
                  Option A <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="optionA"
                  value={formData.optionA}
                  onChange={(e) =>
                    setFormData({ ...formData, optionA: e.target.value })
                  }
                  placeholder="Option A"
                  className={errors.optionA ? "border-destructive" : ""}
                />
                {errors.optionA && (
                  <p className="text-sm text-destructive">{errors.optionA}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionB">
                  Option B <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="optionB"
                  value={formData.optionB}
                  onChange={(e) =>
                    setFormData({ ...formData, optionB: e.target.value })
                  }
                  placeholder="Option B"
                  className={errors.optionB ? "border-destructive" : ""}
                />
                {errors.optionB && (
                  <p className="text-sm text-destructive">{errors.optionB}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionC">
                  Option C <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="optionC"
                  value={formData.optionC}
                  onChange={(e) =>
                    setFormData({ ...formData, optionC: e.target.value })
                  }
                  placeholder="Option C"
                  className={errors.optionC ? "border-destructive" : ""}
                />
                {errors.optionC && (
                  <p className="text-sm text-destructive">{errors.optionC}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionD">
                  Option D <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="optionD"
                  value={formData.optionD}
                  onChange={(e) =>
                    setFormData({ ...formData, optionD: e.target.value })
                  }
                  placeholder="Option D"
                  className={errors.optionD ? "border-destructive" : ""}
                />
                {errors.optionD && (
                  <p className="text-sm text-destructive">{errors.optionD}</p>
                )}
              </div>
            </div>

            {/* Right Answer */}
            <div className="space-y-2">
              <Label htmlFor="rightAnswer">
                Right Answer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.rightAnswer}
                onValueChange={(value) =>
                  setFormData({ ...formData, rightAnswer: value })
                }
              >
                <SelectTrigger
                  className={errors.rightAnswer ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select the correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Option A</SelectItem>
                  <SelectItem value="B">Option B</SelectItem>
                  <SelectItem value="C">Option C</SelectItem>
                  <SelectItem value="D">Option D</SelectItem>
                </SelectContent>
              </Select>
              {errors.rightAnswer && (
                <p className="text-sm text-destructive">{errors.rightAnswer}</p>
              )}
            </div>

            {/* Mark */}
            <div className="space-y-2">
              <Label htmlFor="mark">
                Mark <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mark"
                type="number"
                min="0"
                step="0.01"
                value={formData.mark}
                onChange={(e) =>
                  setFormData({ ...formData, mark: e.target.value })
                }
                placeholder="e.g., 5"
                className={errors.mark ? "border-destructive" : ""}
              />
              {errors.mark && (
                <p className="text-sm text-destructive">{errors.mark}</p>
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
                "Update Question"
              ) : (
                "Create Question"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

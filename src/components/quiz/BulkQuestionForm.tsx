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
import { Loader2, Plus, Trash2, FileText } from "lucide-react";
import {
  BulkQuestionItem,
  CreateBulkQuestionsPayload,
} from "@/redux/features/quiz/quiz.api";
import { Badge } from "@/components/ui/badge";

interface BulkQuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBulkQuestionsPayload) => Promise<void>;
  quizSetId: string;
  isLoading?: boolean;
}

export function BulkQuestionForm({
  open,
  onOpenChange,
  onSubmit,
  quizSetId,
  isLoading = false,
}: BulkQuestionFormProps) {
  const [questions, setQuestions] = useState<BulkQuestionItem[]>([
    {
      question: "",
      options: { A: "", B: "", C: "", D: "" },
      rightAnswer: "A",
      mark: 1,
    },
  ]);

  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {}
  );

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setQuestions([
        {
          question: "",
          options: { A: "", B: "", C: "", D: "" },
          rightAnswer: "A",
          mark: 1,
        },
      ]);
      setErrors({});
    }
  }, [open]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: { A: "", B: "", C: "", D: "" },
        rightAnswer: "A",
        mark: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      const newErrors = { ...errors };
      delete newErrors[index];
      // Reindex errors
      const reindexedErrors: Record<number, Record<string, string>> = {};
      Object.keys(newErrors).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedErrors[oldIndex - 1] = newErrors[oldIndex];
        } else {
          reindexedErrors[oldIndex] = newErrors[oldIndex];
        }
      });
      setErrors(reindexedErrors);
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof BulkQuestionItem | "optionA" | "optionB" | "optionC" | "optionD",
    value: any
  ) => {
    const newQuestions = [...questions];
    if (field === "optionA" || field === "optionB" || field === "optionC" || field === "optionD") {
      const optionKey = field.replace("option", "") as "A" | "B" | "C" | "D";
      newQuestions[index] = {
        ...newQuestions[index],
        options: {
          ...newQuestions[index].options,
          [optionKey]: value,
        },
      };
    } else {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
      };
    }
    setQuestions(newQuestions);
    // Clear error for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<number, Record<string, string>> = {};

    questions.forEach((q, index) => {
      const questionErrors: Record<string, string> = {};

      if (!q.question.trim()) {
        questionErrors.question = "Question is required";
      }

      if (!q.options.A.trim()) {
        questionErrors.optionA = "Option A is required";
      }

      if (!q.options.B.trim()) {
        questionErrors.optionB = "Option B is required";
      }

      if (!q.options.C.trim()) {
        questionErrors.optionC = "Option C is required";
      }

      if (!q.options.D.trim()) {
        questionErrors.optionD = "Option D is required";
      }

      if (!q.rightAnswer) {
        questionErrors.rightAnswer = "Right answer is required";
      }

      if (!q.mark || q.mark < 0) {
        questionErrors.mark = "Mark must be a positive number";
      }

      if (Object.keys(questionErrors).length > 0) {
        newErrors[index] = questionErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        quizSet: quizSetId,
        questions,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bulk Questions</DialogTitle>
          <DialogDescription>
            Add multiple questions at once. You can add or remove questions using
            the buttons below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {questions.length} Question{questions.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Question {index + 1}
                    </h4>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Question */}
                  <div className="space-y-2">
                    <Label>
                      Question <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(index, "question", e.target.value)
                      }
                      placeholder="Enter the question..."
                      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors[index]?.question ? "border-destructive" : ""
                      }`}
                      rows={3}
                    />
                    {errors[index]?.question && (
                      <p className="text-sm text-destructive">
                        {errors[index].question}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {["A", "B", "C", "D"].map((option) => (
                      <div key={option} className="space-y-2">
                        <Label>
                          Option {option}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={question.options[option as "A" | "B" | "C" | "D"]}
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              `option${option}` as "optionA" | "optionB" | "optionC" | "optionD",
                              e.target.value
                            )
                          }
                          placeholder={`Option ${option}`}
                          className={
                            errors[index]?.[`option${option}` as keyof typeof errors[number]]
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {errors[index]?.[`option${option}` as keyof typeof errors[number]] && (
                          <p className="text-sm text-destructive">
                            {errors[index][`option${option}` as keyof typeof errors[number]]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Answer and Mark */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Right Answer <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={question.rightAnswer}
                        onValueChange={(value) =>
                          updateQuestion(
                            index,
                            "rightAnswer",
                            value as "A" | "B" | "C" | "D"
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            errors[index]?.rightAnswer
                              ? "border-destructive"
                              : ""
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Option A</SelectItem>
                          <SelectItem value="B">Option B</SelectItem>
                          <SelectItem value="C">Option C</SelectItem>
                          <SelectItem value="D">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors[index]?.rightAnswer && (
                        <p className="text-sm text-destructive">
                          {errors[index].rightAnswer}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Mark <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={question.mark}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "mark",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="e.g., 5"
                        className={
                          errors[index]?.mark ? "border-destructive" : ""
                        }
                      />
                      {errors[index]?.mark && (
                        <p className="text-sm text-destructive">
                          {errors[index].mark}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                  Creating...
                </>
              ) : (
                `Create ${questions.length} Question${questions.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


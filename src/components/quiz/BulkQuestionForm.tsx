"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Loader2,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  HelpCircle,
  ToggleLeft,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type QuestionType = "mcq" | "boolean" | "short_answer";

interface MCQQuestion {
  type: "mcq";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  rightAnswer: "A" | "B" | "C" | "D";
  mark: number;
}

interface BooleanQuestion {
  type: "boolean";
  question: string;
  booleanAnswer: boolean;
  mark: number;
}

interface ShortAnswerQuestion {
  type: "short_answer";
  question: string;
  expectedAnswer?: string;
  shortAnswerKeywords?: string[];
  mark: number;
}

type QuestionItem = MCQQuestion | BooleanQuestion | ShortAnswerQuestion;

interface BulkQuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  quizSetId: string;
  type: QuestionType;
  isLoading?: boolean;
}

export function BulkQuestionForm({
  open,
  onOpenChange,
  onSubmit,
  quizSetId,
  type,
  isLoading = false,
}: BulkQuestionFormProps) {
  const [selectedType, setSelectedType] = useState<QuestionType>(type);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {},
  );
  const [keywordInput, setKeywordInput] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      setSelectedType(type);
      initializeQuestions(type);
    } else {
      resetForm();
    }
  }, [open, type]);

  useEffect(() => {
    // Initialize with one question when type changes
    initializeQuestions(selectedType);
  }, [selectedType]);

  const resetForm = () => {
    setSelectedType("mcq");
    setQuestions([]);
    setErrors({});
    setKeywordInput({});
  };

  const initializeQuestions = (type: QuestionType) => {
    const newQuestion = createEmptyQuestion(type);
    setQuestions([newQuestion]);
    setErrors({});
    setKeywordInput({});
  };

  const createEmptyQuestion = (type: QuestionType): QuestionItem => {
    switch (type) {
      case "mcq":
        return {
          type: "mcq",
          question: "",
          options: { A: "", B: "", C: "", D: "" },
          rightAnswer: "A",
          mark: 1,
        };
      case "boolean":
        return {
          type: "boolean",
          question: "",
          booleanAnswer: true,
          mark: 1,
        };
      case "short_answer":
        return {
          type: "short_answer",
          question: "",
          expectedAnswer: "",
          shortAnswerKeywords: [],
          mark: 1,
        };
    }
  };

  const addQuestion = () => {
    const newQuestion = createEmptyQuestion(selectedType);
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const updateQuestion = (index: number, updates: Partial<QuestionItem>) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      ...updates,
    } as QuestionItem;
    setQuestions(newQuestions);

    // Clear related errors
    if (errors[index]) {
      const newErrors = { ...errors };
      Object.keys(updates).forEach((key) => {
        delete newErrors[index][key];
      });
      setErrors(newErrors);
    }
  };

  const addKeyword = (index: number) => {
    const keyword = keywordInput[index]?.trim();
    if (!keyword) return;

    const question = questions[index] as ShortAnswerQuestion;
    const keywords = question.shortAnswerKeywords || [];

    if (keywords.includes(keyword)) {
      toast.error("Keyword already exists");
      return;
    }

    updateQuestion(index, {
      shortAnswerKeywords: [...keywords, keyword],
    });
    setKeywordInput({ ...keywordInput, [index]: "" });
  };

  const removeKeyword = (questionIndex: number, keywordIndex: number) => {
    const question = questions[questionIndex] as ShortAnswerQuestion;
    const keywords = [...(question.shortAnswerKeywords || [])];
    keywords.splice(keywordIndex, 1);
    updateQuestion(questionIndex, { shortAnswerKeywords: keywords });
  };

  const validate = () => {
    const newErrors: Record<number, Record<string, string>> = {};

    questions.forEach((q, index) => {
      const questionErrors: Record<string, string> = {};

      if (!q.question.trim()) {
        questionErrors.question = "Question is required";
      }

      if (q.type === "mcq") {
        const mcq = q as MCQQuestion;
        if (!mcq.options.A.trim())
          questionErrors.optionA = "Option A is required";
        if (!mcq.options.B.trim())
          questionErrors.optionB = "Option B is required";
        if (!mcq.options.C.trim())
          questionErrors.optionC = "Option C is required";
        if (!mcq.options.D.trim())
          questionErrors.optionD = "Option D is required";
        if (!mcq.rightAnswer)
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

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    if (!validate()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    try {
      // Format questions according to backend API
      const formattedQuestions = questions.map((q) => {
        const base: any = {
          question: q.question,
          mark: q.mark,
          type: q.type,
        };

        if (q.type === "mcq") {
          const mcq = q as MCQQuestion;
          base.options = mcq.options;
          base.rightAnswer = mcq.rightAnswer;
        } else if (q.type === "boolean") {
          const bool = q as BooleanQuestion;
          base.booleanAnswer = bool.booleanAnswer;
        } else if (q.type === "short_answer") {
          const sa = q as ShortAnswerQuestion;
          base.expectedAnswer = sa.expectedAnswer;
          base.shortAnswerKeywords = sa.shortAnswerKeywords;
        }

        return base;
      });

      await onSubmit({
        quizSet: quizSetId,
        questions: formattedQuestions,
      });

      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case "mcq":
        return <HelpCircle className="h-4 w-4" />;
      case "boolean":
        return <ToggleLeft className="h-4 w-4" />;
      case "short_answer":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case "mcq":
        return "MCQ";
      case "boolean":
        return "True/False";
      case "short_answer":
        return "Short Answer";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add {getTypeLabel(selectedType)} Questions</DialogTitle>
          <DialogDescription>
            Add multiple {getTypeLabel(selectedType)} questions at once.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="space-y-4 flex-1 overflow-y-auto px-1 pt-4">
            {/* Questions Counter and Add Button */}
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 border-b">
              <Badge variant="secondary" className="text-sm">
                {getTypeIcon(selectedType)}
                <span className="ml-1.5">
                  {questions.length} Question{questions.length !== 1 ? "s" : ""}
                </span>
              </Badge>
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

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 bg-card"
                >
                  <div className="flex items-center justify-between">
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

                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label>
                      Question <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(index, { question: e.target.value })
                      }
                      placeholder="Enter the question..."
                      className={
                        errors[index]?.question ? "border-destructive" : ""
                      }
                      rows={3}
                    />
                    {errors[index]?.question && (
                      <p className="text-sm text-destructive">
                        {errors[index].question}
                      </p>
                    )}
                  </div>

                  {/* MCQ Options */}
                  {selectedType === "mcq" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {["A", "B", "C", "D"].map((option) => (
                          <div key={option} className="space-y-2">
                            <Label>
                              Option {option}{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              value={
                                (question as MCQQuestion).options[
                                  option as "A" | "B" | "C" | "D"
                                ]
                              }
                              onChange={(e) =>
                                updateQuestion(index, {
                                  options: {
                                    ...(question as MCQQuestion).options,
                                    [option]: e.target.value,
                                  },
                                })
                              }
                              placeholder={`Option ${option}`}
                              className={
                                errors[index]?.[`option${option}`]
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                            {errors[index]?.[`option${option}`] && (
                              <p className="text-sm text-destructive">
                                {errors[index][`option${option}`]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>
                            Right Answer{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={(question as MCQQuestion).rightAnswer}
                            onValueChange={(value) =>
                              updateQuestion(index, {
                                rightAnswer: value as "A" | "B" | "C" | "D",
                              })
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
                              updateQuestion(index, {
                                mark: parseFloat(e.target.value) || 0,
                              })
                            }
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
                    </>
                  )}

                  {/* Boolean Answer */}
                  {selectedType === "boolean" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Correct Answer{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={(
                            question as BooleanQuestion
                          ).booleanAnswer.toString()}
                          onValueChange={(value) =>
                            updateQuestion(index, {
                              booleanAnswer: value === "true",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
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
                            updateQuestion(index, {
                              mark: parseFloat(e.target.value) || 0,
                            })
                          }
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
                  )}

                  {/* Short Answer */}
                  {selectedType === "short_answer" && (
                    <>
                      <div className="space-y-2">
                        <Label>Expected Answer (Optional)</Label>
                        <Textarea
                          value={
                            (question as ShortAnswerQuestion).expectedAnswer ||
                            ""
                          }
                          onChange={(e) =>
                            updateQuestion(index, {
                              expectedAnswer: e.target.value,
                            })
                          }
                          placeholder="Enter the expected answer..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Keywords (Optional)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={keywordInput[index] || ""}
                            onChange={(e) =>
                              setKeywordInput({
                                ...keywordInput,
                                [index]: e.target.value,
                              })
                            }
                            placeholder="Add a keyword..."
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addKeyword(index);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addKeyword(index)}
                          >
                            Add
                          </Button>
                        </div>
                        {(question as ShortAnswerQuestion)
                          .shortAnswerKeywords &&
                          (question as ShortAnswerQuestion).shortAnswerKeywords!
                            .length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(
                                question as ShortAnswerQuestion
                              ).shortAnswerKeywords!.map((keyword, kidx) => (
                                <Badge
                                  key={kidx}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeKeyword(index, kidx)}
                                >
                                  {keyword} ×
                                </Badge>
                              ))}
                            </div>
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
                            updateQuestion(index, {
                              mark: parseFloat(e.target.value) || 0,
                            })
                          }
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
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || questions.length === 0}
            >
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

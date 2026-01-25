"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCRQuestionExtractor } from "./OCRQuestionExtractor";
import { ExtractedQuestion } from "@/redux/features/ocr/ocr.api";
import { Loader2, CheckCircle2, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OCRQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsSelected: (questions: ExtractedQuestion[]) => void;
  isLoading?: boolean;
}

export function OCRQuestionDialog({
  open,
  onOpenChange,
  onQuestionsSelected,
  isLoading = false,
}: OCRQuestionDialogProps) {
  const [extractedQuestions, setExtractedQuestions] = useState<
    ExtractedQuestion[]
  >([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<ExtractedQuestion | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<
    "mcq" | "boolean" | "short_answer"
  >("mcq");

  const handleQuestionsExtracted = (questions: ExtractedQuestion[]) => {
    setExtractedQuestions(questions);
    // Select all by default
    setSelectedIndices(new Set(questions.map((_, index) => index)));
  };

  const toggleSelection = (index: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedIndices(newSelection);
  };

  const handleAddSelected = () => {
    const selectedQuestions = extractedQuestions.filter((_, index) =>
      selectedIndices.has(index),
    );
    onQuestionsSelected(selectedQuestions);
    // Reset
    setExtractedQuestions([]);
    setSelectedIndices(new Set());
    onOpenChange(false);
  };

  const handleClose = () => {
    setExtractedQuestions([]);
    setSelectedIndices(new Set());
    setEditingIndex(null);
    setEditFormData(null);
    onOpenChange(false);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditFormData({ ...extractedQuestions[index] });
  };

  const handleSaveEdit = (index: number) => {
    if (!editFormData) return;

    const updatedQuestions = [...extractedQuestions];
    updatedQuestions[index] = editFormData;
    setExtractedQuestions(updatedQuestions);
    setEditingIndex(null);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditFormData(null);
  };

  const updateEditForm = (field: string, value: any) => {
    if (!editFormData) return;

    if (field.startsWith("option")) {
      const optionKey = field.replace("option", "").toUpperCase() as
        | "A"
        | "B"
        | "C"
        | "D";
      setEditFormData({
        ...editFormData,
        options: {
          ...(editFormData.options || { A: "", B: "", C: "", D: "" }),
          [optionKey]: value,
        },
      });
    } else {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Extract Questions from Images (AI-Powered)</DialogTitle>
          <DialogDescription>
            Select the question type and upload images. AI will extract them
            automatically. Review and select which questions to add.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection and OCR Extractor */}
          {extractedQuestions.length === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value: any) => setSelectedType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="boolean">True / False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <OCRQuestionExtractor
                onQuestionsExtracted={handleQuestionsExtracted}
                type={selectedType}
              />
            </div>
          )}

          {/* Extracted Questions Preview */}
          {extractedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Extracted Questions ({extractedQuestions.length})
                </h3>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {extractedQuestions.map((question, index) => (
                  <Card
                    key={index}
                    className={`transition-colors ${
                      selectedIndices.has(index)
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    {editingIndex === index ? (
                      // Edit Mode
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <textarea
                            value={editFormData?.question || ""}
                            onChange={(e) =>
                              updateEditForm("question", e.target.value)
                            }
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            rows={3}
                          />
                        </div>

                        {editFormData?.type === "mcq" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Option A</Label>
                              <Input
                                value={editFormData?.options?.A || ""}
                                onChange={(e) =>
                                  updateEditForm("optionA", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Option B</Label>
                              <Input
                                value={editFormData?.options?.B || ""}
                                onChange={(e) =>
                                  updateEditForm("optionB", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Option C</Label>
                              <Input
                                value={editFormData?.options?.C || ""}
                                onChange={(e) =>
                                  updateEditForm("optionC", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Option D</Label>
                              <Input
                                value={editFormData?.options?.D || ""}
                                onChange={(e) =>
                                  updateEditForm("optionD", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {editFormData?.type === "mcq" && (
                            <div className="space-y-2">
                              <Label>Right Answer</Label>
                              <Select
                                value={editFormData?.rightAnswer || "A"}
                                onValueChange={(value) =>
                                  updateEditForm(
                                    "rightAnswer",
                                    value as "A" | "B" | "C" | "D",
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">Option A</SelectItem>
                                  <SelectItem value="B">Option B</SelectItem>
                                  <SelectItem value="C">Option C</SelectItem>
                                  <SelectItem value="D">Option D</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {editFormData?.type === "boolean" && (
                            <div className="space-y-2">
                              <Label>Correct Answer</Label>
                              <Select
                                value={String(editFormData?.booleanAnswer)}
                                onValueChange={(value) =>
                                  updateEditForm(
                                    "booleanAnswer",
                                    value === "true",
                                  )
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
                          )}

                          {editFormData?.type === "short_answer" && (
                            <div className="space-y-2 col-span-2">
                              <Label>Expected Answer</Label>
                              <textarea
                                value={editFormData?.expectedAnswer || ""}
                                onChange={(e) =>
                                  updateEditForm(
                                    "expectedAnswer",
                                    e.target.value,
                                  )
                                }
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                rows={2}
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Mark</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editFormData?.mark || 1}
                              onChange={(e) =>
                                updateEditForm(
                                  "mark",
                                  parseFloat(e.target.value) || 1,
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(index)}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      // View Mode
                      <>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedIndices.has(index)}
                                onCheckedChange={() => toggleSelection(index)}
                              />
                              <CardTitle className="text-base">
                                Question {index + 1}
                              </CardTitle>
                              <Badge variant="secondary">
                                {question.mark} mark
                                {question.mark !== 1 ? "s" : ""}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {question.type.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedIndices.has(index) && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(index);
                                }}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm font-medium">
                            {question.question}
                          </p>

                          {question.type === "mcq" && question.options && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {(["A", "B", "C", "D"] as const).map((opt) => (
                                <div
                                  key={opt}
                                  className={`p-2 rounded ${
                                    question.rightAnswer === opt
                                      ? "bg-green-100 dark:bg-green-900/20 border border-green-500"
                                      : "bg-muted"
                                  }`}
                                >
                                  <span className="font-semibold">{opt}:</span>{" "}
                                  {question.options?.[opt]}
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === "boolean" && (
                            <div className="text-sm">
                              <Badge
                                variant={
                                  question.booleanAnswer ? "default" : "outline"
                                }
                              >
                                Correct Answer:{" "}
                                {question.booleanAnswer ? "True" : "False"}
                              </Badge>
                            </div>
                          )}

                          {question.type === "short_answer" && (
                            <div className="text-sm p-2 bg-muted rounded italic">
                              <strong>Expected:</strong>{" "}
                              {question.expectedAnswer || "Not provided"}
                            </div>
                          )}
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedIndices.size} of {extractedQuestions.length}{" "}
                  question(s) selected
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSelected}
                    disabled={selectedIndices.size === 0 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      `Add ${selectedIndices.size} Question${
                        selectedIndices.size !== 1 ? "s" : ""
                      }`
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

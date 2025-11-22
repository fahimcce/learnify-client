"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  useGetQuizSetByIdQuery,
  useGetAllQuestionsQuery,
  useCreateQuestionMutation,
  useCreateBulkQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useHardDeleteQuestionMutation,
  Question,
  CreateBulkQuestionsPayload,
} from "@/redux/features/quiz/quiz.api";
import { useGetAllQuizSetsQuery } from "@/redux/features/quiz/quiz.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuestionForm } from "@/components/quiz/QuestionForm";
import { BulkQuestionForm } from "@/components/quiz/BulkQuestionForm";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  ArrowLeft,
  FileQuestion,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const quizSetId = params.quizSetId as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [hardDeleteQuestionId, setHardDeleteQuestionId] = useState<
    string | null
  >(null);

  const { data: quizSet, isLoading: isLoadingQuizSet } = useGetQuizSetByIdQuery(
    quizSetId,
    { skip: !quizSetId }
  );
  const {
    data: questions,
    isLoading,
    error,
  } = useGetAllQuestionsQuery(quizSetId, { skip: !quizSetId });
  const { data: quizSets } = useGetAllQuizSetsQuery();
  const [createQuestion, { isLoading: isCreating }] =
    useCreateQuestionMutation();
  const [createBulkQuestions, { isLoading: isCreatingBulk }] =
    useCreateBulkQuestionsMutation();
  const [updateQuestion, { isLoading: isUpdating }] =
    useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: isDeleting }] =
    useDeleteQuestionMutation();
  const [hardDeleteQuestion, { isLoading: isHardDeleting }] =
    useHardDeleteQuestionMutation();

  const handleCreateQuestion = async (data: any) => {
    try {
      await createQuestion(data).unwrap();
      toast.success("Question created successfully!");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create question. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleCreateBulkQuestions = async (
    data: CreateBulkQuestionsPayload
  ) => {
    try {
      const result = await createBulkQuestions(data).unwrap();
      toast.success(`${result.length} question(s) created successfully!`);
      setIsBulkCreateDialogOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create questions. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateQuestion = async (data: any) => {
    if (!selectedQuestion) return;
    try {
      await updateQuestion({ id: selectedQuestion._id, data }).unwrap();
      toast.success("Question updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedQuestion(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update question. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionId) return;
    try {
      await deleteQuestion(deleteQuestionId).unwrap();
      toast.success("Question deleted successfully!");
      setDeleteQuestionId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete question. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleHardDeleteQuestion = async () => {
    if (!hardDeleteQuestionId) return;
    try {
      await hardDeleteQuestion(hardDeleteQuestionId).unwrap();
      toast.success("Question permanently deleted!");
      setHardDeleteQuestionId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete question. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditDialogOpen(true);
  };

  // Filter questions
  const questionsArray = Array.isArray(questions) ? questions : [];
  const quizSetsArray = Array.isArray(quizSets) ? quizSets : [];
  const filteredQuestions = questionsArray.filter((question) => {
    return question.question.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoadingQuizSet || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !quizSet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load questions. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/quizzes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {quizSet.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage questions for this quiz set
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Single
          </Button>
          <Button
            onClick={() => setIsBulkCreateDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Bulk
          </Button>
        </div>
      </div>

      {/* Quiz Set Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Set Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{quizSet.duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Marks</p>
              <p className="font-medium">{quizSet.totalMarks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="font-medium">{questionsArray.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={quizSet.isDeleted ? "secondary" : "default"}
                className="mt-1"
              >
                {quizSet.isDeleted ? "Inactive" : "Active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4 ">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant="secondary">{question.mark} marks</Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Options */}
                    <div className="grid grid-cols-2 gap-3">
                      {["A", "B", "C", "D"].map((option) => {
                        const isCorrect = question.rightAnswer === option;
                        return (
                          <div
                            key={option}
                            className={`p-3 rounded-md border ${
                              isCorrect
                                ? "border-green-500 bg-green-50 dark:bg-green-950"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              )}
                              <div className="flex-1">
                                <span className="font-medium">
                                  Option {option}:
                                </span>
                                <p className="text-sm mt-1">
                                  {
                                    question.options[
                                      option as "A" | "B" | "C" | "D"
                                    ]
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(question)}
                        className="flex-1"
                        disabled={question.isDeleted}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteQuestionId(question._id)}
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No questions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Get started by adding your first question"}
              </p>
              {!searchTerm && (
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Single
                  </Button>
                  <Button onClick={() => setIsBulkCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bulk
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Question Dialog */}
      <QuestionForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateQuestion}
        quizSets={quizSetsArray}
        defaultQuizSetId={quizSetId}
        isLoading={isCreating}
      />

      {/* Create Bulk Questions Dialog */}
      <BulkQuestionForm
        open={isBulkCreateDialogOpen}
        onOpenChange={setIsBulkCreateDialogOpen}
        onSubmit={handleCreateBulkQuestions}
        quizSetId={quizSetId}
        isLoading={isCreatingBulk}
      />

      {/* Edit Question Dialog */}
      <QuestionForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateQuestion}
        initialData={selectedQuestion}
        quizSets={quizSetsArray}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteQuestionId}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the question. It can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirmation Dialog */}
      <AlertDialog
        open={!!hardDeleteQuestionId}
        onOpenChange={(open) => !open && setHardDeleteQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHardDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDeleteQuestion}
              disabled={isHardDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isHardDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

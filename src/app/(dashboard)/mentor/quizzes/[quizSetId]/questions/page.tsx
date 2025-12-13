"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetQuizSetByIdQuery,
  useGetAllQuestionsQuery,
  useGetAllQuizSetsQuery,
  useCreateQuestionMutation,
  useCreateBulkQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useHardDeleteQuestionMutation,
  Question,
} from "@/redux/features/quiz/quiz.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionForm } from "@/components/quiz/QuestionForm";
import { BulkQuestionForm } from "@/components/quiz/BulkQuestionForm";
import { OCRQuestionDialog } from "@/components/quiz/OCRQuestionDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { HardDeleteDialog } from "@/components/dialogs/HardDeleteDialog";
import { ExtractedQuestion } from "@/redux/features/ocr/ocr.api";
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
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function MentorQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const quizSetId = params.quizSetId as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
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
    refetch: refetchQuestions,
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
      refetchQuestions();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create question. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleCreateBulkQuestions = async (data: any) => {
    try {
      await createBulkQuestions(data).unwrap();
      toast.success("Questions created successfully!");
      setIsBulkCreateDialogOpen(false);
      refetchQuestions();
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
      refetchQuestions();
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
      refetchQuestions();
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
      refetchQuestions();
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

  const handleOCRQuestionsSelected = async (questions: ExtractedQuestion[]) => {
    try {
      // Convert extracted questions to bulk format
      const bulkData = {
        quizSet: quizSetId,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          rightAnswer: q.rightAnswer,
          mark: q.mark,
        })),
      };

      await createBulkQuestions(bulkData).unwrap();
      toast.success(
        `Successfully added ${questions.length} question(s) from images!`
      );
      refetchQuestions();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to add questions. Please try again.";
      toast.error(errorMessage);
    }
  };

  const questionsArray = Array.isArray(questions) ? questions : [];
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
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Questions For - {quizSet.title}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOCRDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Extract
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBulkCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create manually
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="flex flex-col sm:flex-row gap-4 md:w-2/3">
          <div className="flex-1">
            <div className="relative h-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-full"
              />
            </div>
          </div>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <div className="border p-4 rounded-md md:w-1/3 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {quizSet.duration} minutes | Total Marks: {quizSet.totalMarks}
            </p>
          </div>
          <Badge variant="default">
            {questionsArray.length} Question
            {questionsArray.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((question: Question, index: number) => (
            <Card key={question._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge variant="secondary">
                        {question.mark} mark{question.mark !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {question.question}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteQuestionId(question._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 p-2 rounded ${
                        question.rightAnswer === key
                          ? "bg-green-100 dark:bg-green-900/20 border border-green-500"
                          : "bg-muted"
                      }`}
                    >
                      <span className="font-semibold">{key}:</span>
                      <span className="flex-1">{value}</span>
                      {question.rightAnswer === key && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No questions found" : "No questions yet"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by creating your first question for this quiz set"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Question Forms */}
      <QuestionForm
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          setIsEditDialogOpen(open);
          if (!open) setSelectedQuestion(null);
        }}
        quizSets={Array.isArray(quizSets) ? quizSets : []}
        defaultQuizSetId={quizSetId}
        initialData={selectedQuestion || undefined}
        onSubmit={
          selectedQuestion ? handleUpdateQuestion : handleCreateQuestion
        }
        isLoading={selectedQuestion ? isUpdating : isCreating}
      />

      <BulkQuestionForm
        open={isBulkCreateDialogOpen}
        onOpenChange={setIsBulkCreateDialogOpen}
        quizSetId={quizSetId}
        onSubmit={handleCreateBulkQuestions}
        isLoading={isCreatingBulk}
      />

      {/* OCR Dialog */}
      <OCRQuestionDialog
        open={isOCRDialogOpen}
        onOpenChange={setIsOCRDialogOpen}
        onQuestionsSelected={handleOCRQuestionsSelected}
        isLoading={isCreatingBulk}
      />

      {/* Delete Dialogs */}
      <DeleteDialog
        open={!!deleteQuestionId}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
        onConfirm={handleDeleteQuestion}
        isLoading={isDeleting}
        itemName="Question"
      />

      <HardDeleteDialog
        open={!!hardDeleteQuestionId}
        onOpenChange={(open) => !open && setHardDeleteQuestionId(null)}
        onConfirm={handleHardDeleteQuestion}
        isLoading={isHardDeleting}
        itemName="Question"
      />
    </div>
  );
}

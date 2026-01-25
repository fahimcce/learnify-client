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
  HelpCircle,
  ToggleLeft,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type QuestionType = "mcq" | "boolean" | "short_answer";

export default function MentorQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const quizSetId = params.quizSetId as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] =
    useState<QuestionType>("mcq");
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [hardDeleteQuestionId, setHardDeleteQuestionId] = useState<
    string | null
  >(null);

  const handleOpenCreateDialog = (type: QuestionType) => {
    setSelectedQuestionType(type);
    setIsCreateDialogOpen(true);
  };

  const { data: quizSet, isLoading: isLoadingQuizSet } = useGetQuizSetByIdQuery(
    quizSetId,
    { skip: !quizSetId },
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

  const handleOpenBulkDialog = (type: QuestionType) => {
    const questionsArray = Array.isArray(questions) ? questions : [];
    const existingType =
      questionsArray.length > 0
        ? (questionsArray[0] as any).type || "mcq"
        : null;

    if (existingType && existingType !== type) {
      const typeLabels: Record<string, string> = {
        mcq: "MCQ",
        boolean: "True/False",
        short_answer: "Short Answer",
      };
      toast.error(
        `This quiz set already contains ${typeLabels[existingType]} questions. Mixed types are not allowed.`,
      );
      return;
    }

    setSelectedQuestionType(type);
    setIsBulkCreateDialogOpen(true);
  };

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
        questions: questions.map((q) => {
          const base: any = {
            question: q.question,
            mark: q.mark,
            type: q.type,
          };

          if (q.type === "mcq") {
            base.options = q.options;
            base.rightAnswer = q.rightAnswer;
          } else if (q.type === "boolean") {
            base.booleanAnswer = q.booleanAnswer;
          } else if (q.type === "short_answer") {
            base.expectedAnswer = q.expectedAnswer;
            base.shortAnswerKeywords = q.shortAnswerKeywords;
          }

          return base;
        }),
      };

      await createBulkQuestions(bulkData).unwrap();
      toast.success(
        `Successfully added ${questions.length} question(s) from images!`,
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

      {/* Question Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const currentQuestions = Array.isArray(questions) ? questions : [];
          const existingType =
            currentQuestions.length > 0
              ? (currentQuestions[0] as any).type || "mcq"
              : null;

          return (
            <>
              {/* MCQ Card */}
              <Card
                className={`transition-all ${
                  existingType && existingType !== "mcq"
                    ? "opacity-50 cursor-not-allowed grayscale-[0.5]"
                    : "cursor-pointer hover:shadow-lg hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 group"
                }`}
                onClick={() =>
                  (!existingType || existingType === "mcq") &&
                  handleOpenBulkDialog("mcq")
                }
              >
                <CardContent className="flex items-center gap-4 py-6 relative overflow-hidden">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform">
                    <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">MCQ</h3>
                      {existingType && existingType !== "mcq" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 uppercase"
                        >
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Multiple Choice Question
                    </p>
                  </div>
                  {(!existingType || existingType === "mcq") && (
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-blue-600" />
                  )}
                </CardContent>
              </Card>

              {/* True/False Card */}
              <Card
                className={`transition-all ${
                  existingType && existingType !== "boolean"
                    ? "opacity-50 cursor-not-allowed grayscale-[0.5]"
                    : "cursor-pointer hover:shadow-lg hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20 group"
                }`}
                onClick={() =>
                  (!existingType || existingType === "boolean") &&
                  handleOpenBulkDialog("boolean")
                }
              >
                <CardContent className="flex items-center gap-4 py-6 relative overflow-hidden">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl group-hover:scale-110 transition-transform">
                    <ToggleLeft className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">True / False</h3>
                      {existingType && existingType !== "boolean" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 uppercase"
                        >
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Boolean Question
                    </p>
                  </div>
                  {(!existingType || existingType === "boolean") && (
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-green-600" />
                  )}
                </CardContent>
              </Card>

              {/* Short Answer Card */}
              <Card
                className={`transition-all ${
                  existingType && existingType !== "short_answer"
                    ? "opacity-50 cursor-not-allowed grayscale-[0.5]"
                    : "cursor-pointer hover:shadow-lg hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 group"
                }`}
                onClick={() =>
                  (!existingType || existingType === "short_answer") &&
                  handleOpenBulkDialog("short_answer")
                }
              >
                <CardContent className="flex items-center gap-4 py-6 relative overflow-hidden">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Short Answer</h3>
                      {existingType && existingType !== "short_answer" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 uppercase"
                        >
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mentor Evaluated
                    </p>
                  </div>
                  {(!existingType || existingType === "short_answer") && (
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-orange-600" />
                  )}
                </CardContent>
              </Card>
            </>
          );
        })()}
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
                      <Badge
                        variant={
                          (question as any).type === "mcq"
                            ? "default"
                            : (question as any).type === "boolean"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {(question as any).type === "mcq"
                          ? "MCQ"
                          : (question as any).type === "boolean"
                            ? "True/False"
                            : (question as any).type === "short_answer"
                              ? "Short Answer"
                              : "MCQ"}
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
                {/* MCQ Options */}
                {((question as any).type === "mcq" ||
                  !(question as any).type) &&
                  question.options && (
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
                  )}

                {/* Boolean Answer */}
                {(question as any).type === "boolean" && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Correct Answer:
                    </span>
                    <Badge
                      variant={
                        (question as any).booleanAnswer
                          ? "default"
                          : "destructive"
                      }
                    >
                      {(question as any).booleanAnswer ? "True" : "False"}
                    </Badge>
                  </div>
                )}

                {/* Short Answer */}
                {(question as any).type === "short_answer" && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Expected Answer:
                      </span>
                      <p className="mt-1 p-2 bg-muted rounded text-sm">
                        {(question as any).expectedAnswer ||
                          "No expected answer provided"}
                      </p>
                    </div>
                    {(question as any).shortAnswerKeywords?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(question as any).shortAnswerKeywords.map(
                            (keyword: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {keyword}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ This question requires manual grading
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {searchTerm ? "No questions found" : "No questions yet"}
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Choose a question type above to start building your quiz"}
            </p>
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
        defaultType={selectedQuestionType}
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
        type={selectedQuestionType}
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

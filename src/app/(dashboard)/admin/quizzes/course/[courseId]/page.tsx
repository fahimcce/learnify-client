"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  useGetAllQuizSetsQuery,
  useCreateQuizSetMutation,
  useUpdateQuizSetMutation,
  useDeleteQuizSetMutation,
  useHardDeleteQuizSetMutation,
  useGetAllExamAttemptsByQuizSetQuery,
  QuizSet,
} from "@/redux/features/quiz/quiz.api";
import {
  useGetCourseByIdQuery,
  useGetAllCoursesQuery,
} from "@/redux/features/course/course.api";
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
import { QuizSetForm } from "@/components/quiz/QuizSetForm";
import { ExamAttemptsDialog } from "@/components/quiz/ExamAttemptsDialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  ArrowLeft,
  ClipboardList,
  Filter,
  X,
  Clock,
  FileQuestion,
  BookOpen,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CourseQuizSetsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [deleteQuizSetId, setDeleteQuizSetId] = useState<string | null>(null);
  const [hardDeleteQuizSetId, setHardDeleteQuizSetId] = useState<string | null>(
    null
  );
  const [examAttemptsDialogOpen, setExamAttemptsDialogOpen] = useState(false);
  const [selectedQuizSetForAttempts, setSelectedQuizSetForAttempts] =
    useState<QuizSet | null>(null);

  const { data: course, isLoading: isLoadingCourse } = useGetCourseByIdQuery(
    courseId,
    { skip: !courseId }
  );
  const {
    data: quizSets,
    isLoading,
    error,
  } = useGetAllQuizSetsQuery({
    course: courseId,
  });
  const { data: courses } = useGetAllCoursesQuery();
  const [createQuizSet, { isLoading: isCreating }] = useCreateQuizSetMutation();
  const [updateQuizSet, { isLoading: isUpdating }] = useUpdateQuizSetMutation();
  const [deleteQuizSet, { isLoading: isDeleting }] = useDeleteQuizSetMutation();
  const [hardDeleteQuizSet, { isLoading: isHardDeleting }] =
    useHardDeleteQuizSetMutation();

  const handleCreateQuizSet = async (data: any) => {
    try {
      await createQuizSet(data).unwrap();
      toast.success("Quiz Set created successfully!");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to create quiz set. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateQuizSet = async (data: any) => {
    if (!selectedQuizSet) return;
    try {
      await updateQuizSet({ id: selectedQuizSet._id, data }).unwrap();
      toast.success("Quiz Set updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedQuizSet(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update quiz set. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteQuizSet = async () => {
    if (!deleteQuizSetId) return;
    try {
      await deleteQuizSet(deleteQuizSetId).unwrap();
      toast.success("Quiz Set deleted successfully!");
      setDeleteQuizSetId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete quiz set. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleHardDeleteQuizSet = async () => {
    if (!hardDeleteQuizSetId) return;
    try {
      await hardDeleteQuizSet(hardDeleteQuizSetId).unwrap();
      toast.success("Quiz Set permanently deleted!");
      setHardDeleteQuizSetId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete quiz set. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (quizSet: QuizSet) => {
    setSelectedQuizSet(quizSet);
    setIsEditDialogOpen(true);
  };

  // Filter quiz sets
  const quizSetsArray = Array.isArray(quizSets) ? quizSets : [];
  const coursesArray = Array.isArray(courses) ? courses : [];
  const filteredQuizSets = quizSetsArray.filter((quizSet) => {
    return quizSet.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoadingCourse || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load quiz sets. Please try again.
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
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              {course.courseName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage quiz sets for {course.courseCode}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Quiz Set
        </Button>
      </div>

      {/* Quiz Sets Grid */}
      {filteredQuizSets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizSets.map((quizSet) => (
            <motion.div
              key={quizSet._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`relative ${
                  quizSet.isDeleted ? "opacity-60 border-dashed" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{quizSet.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Quiz Set for {course.courseName}
                      </CardDescription>
                    </div>
                    {quizSet.isDeleted && (
                      <Badge variant="secondary" className="ml-2">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration:
                        </span>
                        <p className="font-medium">{quizSet.duration} min</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <FileQuestion className="h-3 w-3" />
                          Total Marks:
                        </span>
                        <p className="font-medium">{quizSet.totalMarks}</p>
                      </div>
                    </div>

                    {quizSet.questionCount !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Questions:{" "}
                        </span>
                        <span className="font-medium">
                          {quizSet.questionCount}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Link
                        href={`/admin/quizzes/${quizSet._id}/questions`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <FileQuestion className="mr-2 h-3 w-3" />
                          Questions
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(quizSet)}
                        className="flex-1"
                        disabled={quizSet.isDeleted}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteQuizSetId(quizSet._id)}
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedQuizSetForAttempts(quizSet);
                          setExamAttemptsDialogOpen(true);
                        }}
                      >
                        <Users className="mr-2 h-3 w-3" />
                        View Exam Attempts
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
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quiz sets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : `No quiz sets created for ${course.courseName} yet. Get started by creating your first quiz set.`}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quiz Set
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Quiz Set Dialog */}
      <QuizSetForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateQuizSet}
        courses={coursesArray.filter((c) => !c.isDeleted)}
        defaultCourseId={courseId}
        isLoading={isCreating}
      />

      {/* Edit Quiz Set Dialog */}
      <QuizSetForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateQuizSet}
        initialData={selectedQuizSet}
        courses={coursesArray.filter((c) => !c.isDeleted)}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteQuizSetId}
        onOpenChange={(open) => !open && setDeleteQuizSetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the quiz set. It can be restored later. All
              questions in this quiz set will also be soft deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuizSet}
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
        open={!!hardDeleteQuizSetId}
        onOpenChange={(open) => !open && setHardDeleteQuizSetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              quiz set and all its questions from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHardDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDeleteQuizSet}
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

      {/* Exam Attempts Dialog */}
      {selectedQuizSetForAttempts && (
        <ExamAttemptsDialog
          open={examAttemptsDialogOpen}
          onOpenChange={setExamAttemptsDialogOpen}
          quizSetId={selectedQuizSetForAttempts._id}
          quizSetTitle={selectedQuizSetForAttempts.title}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, BookOpen, ArrowLeft, Plus, Edit, Trash2, Clock, FileText } from "lucide-react";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard/DashboardComponents";
import Link from "next/link";
import { useGetMyAssignedCoursesQuery } from "@/redux/features/course/course.api";
import { 
  useGetAllQuizSetsQuery, 
  useCreateQuizSetMutation, 
  useUpdateQuizSetMutation, 
  useDeleteQuizSetMutation 
} from "@/redux/features/quiz/quiz.api";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { QuizSetForm } from "@/components/quiz/QuizSetForm";
import { toast } from "sonner";
import { DeleteQuizSetDialog } from "../courses/[id]/_components/DeleteQuizSetDialog";

export default function MentorQuizzesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isCreateQuizDialogOpen, setIsCreateQuizDialogOpen] = useState(false);
  const [isEditQuizDialogOpen, setIsEditQuizDialogOpen] = useState(false);
  const [selectedQuizSet, setSelectedQuizSet] = useState<any>(null);
  const [deleteQuizSetId, setDeleteQuizSetId] = useState<string | null>(null);

  // Fetch mentor's assigned courses
  const { data: courses, isLoading: isLoadingCourses } = useGetMyAssignedCoursesQuery();

  // Fetch quizzes for selected course
  const { data: quizSets, isLoading: isLoadingQuizSets, refetch: refetchQuizSets } = useGetAllQuizSetsQuery(
    { course: selectedCourseId! },
    { skip: !selectedCourseId }
  );

  const [createQuizSet, { isLoading: isCreatingQuiz }] = useCreateQuizSetMutation();
  const [updateQuizSet, { isLoading: isUpdatingQuiz }] = useUpdateQuizSetMutation();
  const [deleteQuizSet, { isLoading: isDeletingQuiz }] = useDeleteQuizSetMutation();

  const coursesArray = Array.isArray(courses) ? courses : [];
  const quizSetsArray = Array.isArray(quizSets) ? quizSets : [];

  const handleCreateQuizSet = async (data: any) => {
    try {
      await createQuizSet(data).unwrap();
      toast.success("Quiz Set created successfully!");
      setIsCreateQuizDialogOpen(false);
      refetchQuizSets();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create quiz set");
      throw error;
    }
  };

  const handleUpdateQuizSet = async (data: any) => {
    if (!selectedQuizSet) return;
    try {
      await updateQuizSet({ id: selectedQuizSet._id, data }).unwrap();
      toast.success("Quiz Set updated successfully!");
      setIsEditQuizDialogOpen(false);
      setSelectedQuizSet(null);
      refetchQuizSets();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update quiz set");
      throw error;
    }
  };

  const handleDeleteQuizSet = async () => {
    if (!deleteQuizSetId) return;
    try {
      await deleteQuizSet(deleteQuizSetId).unwrap();
      toast.success("Quiz Set deleted successfully");
      setDeleteQuizSetId(null);
      refetchQuizSets();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete quiz set");
    }
  };

  // If no course selected, show course selection
  if (!selectedCourseId) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="Quizzes"
          description="Select a course to manage quizzes"
        />

        {isLoadingCourses ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : coursesArray.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coursesArray.map((course: any, index: number) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedCourseId(course._id)}
                >
                  <DashboardCard className="hover:scale-105 hover:border-primary/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{course.courseName}</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {course.courseCode}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <DashboardCard>
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No courses assigned</h3>
              <p className="text-muted-foreground">
                You don't have any assigned courses yet
              </p>
            </div>
          </DashboardCard>
        )}
      </div>
    );
  }

  // Show quizzes for selected course
  const selectedCourse = coursesArray.find((c: any) => c._id === selectedCourseId);

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => setSelectedCourseId(null)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <DashboardPageHeader
          title={`Quizzes - ${selectedCourse?.courseName}`}
          description={`Create and manage quizzes for ${selectedCourse?.courseCode}`}
          action={
            <Button 
              onClick={() => setIsCreateQuizDialogOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz Set
            </Button>
          }
        />
      </div>

      {isLoadingQuizSets ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : quizSetsArray.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizSetsArray.map((quizSet: any, index: number) => (
            <motion.div
              key={quizSet._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <DashboardCard className="hover:scale-105">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{quizSet.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {quizSet.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {quizSet.totalMarks} marks
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={quizSet.isDeleted ? "secondary" : "default"}>
                    {quizSet.isDeleted ? "Inactive" : "Active"}
                  </Badge>
                </div>
                
                {quizSet.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {quizSet.description}
                  </p>
                )}

                <p className="text-xs text-muted-foreground mb-4">
                  Created {formatDistanceToNow(new Date(quizSet.createdAt), { addSuffix: true })}
                </p>

                <div className="flex gap-2">
                  <Link href={`/mentor/quizzes/${quizSet._id}/questions`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => setDeleteQuizSetId(quizSet._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </DashboardCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <DashboardCard>
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quiz for this course
            </p>
            <Button 
              onClick={() => setIsCreateQuizDialogOpen(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz Set
            </Button>
          </div>
        </DashboardCard>
      )}

      {/* Quiz Dialogs */}
      {selectedCourseId && (
        <>
          <QuizSetForm
            open={isCreateQuizDialogOpen}
            onOpenChange={setIsCreateQuizDialogOpen}
            onSubmit={handleCreateQuizSet}
            courses={coursesArray.filter((c: any) => !c.isDeleted)}
            defaultCourseId={selectedCourseId}
            isLoading={isCreatingQuiz}
          />
          <QuizSetForm
            open={isEditQuizDialogOpen}
            onOpenChange={setIsEditQuizDialogOpen}
            onSubmit={handleUpdateQuizSet}
            initialData={selectedQuizSet}
            courses={coursesArray.filter((c: any) => !c.isDeleted)}
            isLoading={isUpdatingQuiz}
          />
          <DeleteQuizSetDialog
            open={!!deleteQuizSetId}
            onOpenChange={(open: boolean) => !open && setDeleteQuizSetId(null)}
            onConfirm={handleDeleteQuizSet}
            isLoading={isDeletingQuiz}
          />
        </>
      )}
    </div>
  );
}

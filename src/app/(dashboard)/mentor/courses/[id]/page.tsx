"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useGetCourseByIdQuery,
  useGetAllCoursesQuery,
  Course,
} from "@/redux/features/course/course.api";
import {
  useGetAllQuizSetsQuery,
  useCreateQuizSetMutation,
  useUpdateQuizSetMutation,
  useDeleteQuizSetMutation,
  useHardDeleteQuizSetMutation,
  QuizSet,
} from "@/redux/features/quiz/quiz.api";
import {
  useGetCourseResourcesQuery,
  useUploadResourceFileMutation,
  useDeleteResourceMutation,
  useHardDeleteResourceMutation,
  CourseResource,
} from "@/redux/features/courseResource/courseResource.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  ClipboardList,
  FolderOpen,
  ExternalLink,
  Download,
  PlayCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  File,
  Clock,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { QuizSetForm } from "@/components/quiz/QuizSetForm";
import { ResourceForm } from "@/components/resource/ResourceForm";
import Link from "next/link";
import { DeleteResourceDialog } from "./_components/DeleteResourceDialog";
import { HardDeleteResourceDialog } from "./_components/HardDeleteResourceDialog";
import { DeleteQuizSetDialog } from "./_components/DeleteQuizSetDialog";
import { HardDeleteQuizSetDialog } from "./_components/HardDeleteQuizSetDialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function MentorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [activeTab, setActiveTab] = useState<"resources" | "quizzes">(
    "resources"
  );

  // Resources state
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] =
    useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [hardDeleteResourceId, setHardDeleteResourceId] = useState<
    string | null
  >(null);

  // Quizzes state
  const [isCreateQuizDialogOpen, setIsCreateQuizDialogOpen] = useState(false);
  const [isEditQuizDialogOpen, setIsEditQuizDialogOpen] = useState(false);
  const [selectedQuizSet, setSelectedQuizSet] = useState<QuizSet | null>(null);
  const [deleteQuizSetId, setDeleteQuizSetId] = useState<string | null>(null);
  const [hardDeleteQuizSetId, setHardDeleteQuizSetId] = useState<string | null>(
    null
  );

  const { data: course, isLoading, error } = useGetCourseByIdQuery(courseId);
  const { data: courses } = useGetAllCoursesQuery();

  const {
    data: resources,
    isLoading: isLoadingResources,
    refetch: refetchResources,
  } = useGetCourseResourcesQuery(
    { courseId },
    { skip: activeTab !== "resources" }
  );

  const {
    data: quizSets,
    isLoading: isLoadingQuizSets,
    refetch: refetchQuizSets,
  } = useGetAllQuizSetsQuery(
    { course: courseId },
    { skip: activeTab !== "quizzes" }
  );

  const [uploadResource, { isLoading: isUploadingResource }] =
    useUploadResourceFileMutation();
  const [deleteResource, { isLoading: isDeletingResource }] =
    useDeleteResourceMutation();
  const [hardDeleteResource, { isLoading: isHardDeletingResource }] =
    useHardDeleteResourceMutation();
  const [createQuizSet, { isLoading: isCreatingQuiz }] =
    useCreateQuizSetMutation();
  const [updateQuizSet, { isLoading: isUpdatingQuiz }] =
    useUpdateQuizSetMutation();
  const [deleteQuizSet, { isLoading: isDeletingQuiz }] =
    useDeleteQuizSetMutation();
  const [hardDeleteQuizSet, { isLoading: isHardDeletingQuiz }] =
    useHardDeleteQuizSetMutation();

  const resourcesArray = Array.isArray(resources) ? resources : [];
  const quizSetsArray = Array.isArray(quizSets) ? quizSets : [];
  const coursesArray = Array.isArray(courses) ? courses : [];

  const handleCreateResource = async (data: {
    courseId: string;
    title: string;
    description?: string;
    file: File;
    category?: "resource" | "question-bank";
  }) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.category) formData.append("category", data.category);

      await uploadResource({
        courseId: data.courseId,
        formData,
      }).unwrap();
      toast.success("Resource uploaded successfully!");
      refetchResources();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to upload resource. Please try again."
      );
      throw error;
    }
  };

  const handleCreateQuizSet = async (data: any) => {
    try {
      await createQuizSet(data).unwrap();
      toast.success("Quiz Set created successfully!");
      refetchQuizSets();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to create quiz set. Please try again."
      );
      throw error;
    }
  };

  const handleUpdateQuizSet = async (data: any) => {
    if (!selectedQuizSet) return;
    try {
      await updateQuizSet({ id: selectedQuizSet._id, data }).unwrap();
      toast.success("Quiz Set updated successfully!");
      setSelectedQuizSet(null);
      refetchQuizSets();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update quiz set. Please try again."
      );
      throw error;
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <PlayCircle className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "link":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const handleDeleteResource = async () => {
    if (!deleteResourceId) return;
    try {
      await deleteResource(deleteResourceId).unwrap();
      toast.success("Resource deleted successfully");
      setDeleteResourceId(null);
      refetchResources();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete resource");
    }
  };

  const handleHardDeleteResource = async () => {
    if (!hardDeleteResourceId) return;
    try {
      await hardDeleteResource(hardDeleteResourceId).unwrap();
      toast.success("Resource permanently deleted");
      setHardDeleteResourceId(null);
      refetchResources();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete resource");
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

  const handleHardDeleteQuizSet = async () => {
    if (!hardDeleteQuizSetId) return;
    try {
      await hardDeleteQuizSet(hardDeleteQuizSetId).unwrap();
      toast.success("Quiz Set permanently deleted");
      setHardDeleteQuizSetId(null);
      refetchQuizSets();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete quiz set");
    }
  };

  if (isLoading) {
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
              Failed to load course. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/mentor">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/mentor/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course.courseName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex gap-2 mb-2">
        <Button
          variant={activeTab === "resources" ? "default" : "ghost"}
          onClick={() => setActiveTab("resources")}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Resources
        </Button>
        <Button
          variant={activeTab === "quizzes" ? "default" : "ghost"}
          onClick={() => setActiveTab("quizzes")}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Quizzes
        </Button>
      </div>

      {activeTab === "resources" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Course Resources</h2>
            <Button onClick={() => setIsCreateResourceDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          {isLoadingResources ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Resources Card */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  router.push(`/mentor/courses/${courseId}/resources/resource`)
                }
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">Resources</CardTitle>
                      <CardDescription>
                        {
                          resourcesArray.filter(
                            (r) => r.category === "resource"
                          ).length
                        }{" "}
                        resource
                        {resourcesArray.filter((r) => r.category === "resource")
                          .length !== 1
                          ? "s"
                          : ""}
                      </CardDescription>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                  </div>
                </CardHeader>
              </Card>

              {/* Question Bank Card */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  router.push(
                    `/mentor/courses/${courseId}/resources/question-bank`
                  )
                }
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">Question Bank</CardTitle>
                      <CardDescription>
                        {
                          resourcesArray.filter(
                            (r) => r.category === "question-bank"
                          ).length
                        }{" "}
                        item
                        {resourcesArray.filter(
                          (r) => r.category === "question-bank"
                        ).length !== 1
                          ? "s"
                          : ""}
                      </CardDescription>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180" />
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Quiz Sets</h2>
            <Button onClick={() => setIsCreateQuizDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz Set
            </Button>
          </div>

          {isLoadingQuizSets ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : quizSetsArray.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quizSetsArray.map((quizSet: QuizSet) => (
                <Card key={quizSet._id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{quizSet.title}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedQuizSet(quizSet);
                            setIsEditQuizDialogOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteQuizSetId(quizSet._id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{quizSet.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{quizSet.totalMarks} marks</span>
                      </div>
                    </div>
                    <Link href={`/mentor/quizzes/${quizSet._id}/questions`}>
                      <Button variant="outline" className="w-full">
                        Manage Questions
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No quiz sets yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Start by creating your first quiz set for this course
                </p>
                <Button onClick={() => setIsCreateQuizDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quiz Set
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Resource Dialogs */}
      {coursesArray.length > 0 && (
        <ResourceForm
          open={isCreateResourceDialogOpen}
          onOpenChange={setIsCreateResourceDialogOpen}
          onSubmit={handleCreateResource}
          courses={coursesArray.filter((c) => !c.isDeleted)}
          defaultCourseId={courseId}
          isLoading={isUploadingResource}
        />
      )}

      {/* Quiz Dialogs */}
      {coursesArray.length > 0 && (
        <>
          <QuizSetForm
            open={isCreateQuizDialogOpen}
            onOpenChange={(open) => {
              setIsCreateQuizDialogOpen(open);
              if (!open) setSelectedQuizSet(null);
            }}
            onSubmit={handleCreateQuizSet}
            courses={coursesArray.filter((c) => !c.isDeleted)}
            defaultCourseId={courseId}
            isLoading={isCreatingQuiz}
          />
          <QuizSetForm
            open={isEditQuizDialogOpen}
            onOpenChange={(open) => {
              setIsEditQuizDialogOpen(open);
              if (!open) setSelectedQuizSet(null);
            }}
            onSubmit={handleUpdateQuizSet}
            initialData={selectedQuizSet}
            courses={coursesArray.filter((c) => !c.isDeleted)}
            isLoading={isUpdatingQuiz}
          />
        </>
      )}

      {/* Delete Resource Dialogs */}
      <DeleteResourceDialog
        open={!!deleteResourceId}
        onOpenChange={(open) => !open && setDeleteResourceId(null)}
        onConfirm={handleDeleteResource}
        isLoading={isDeletingResource}
      />

      <HardDeleteResourceDialog
        open={!!hardDeleteResourceId}
        onOpenChange={(open) => !open && setHardDeleteResourceId(null)}
        onConfirm={handleHardDeleteResource}
        isLoading={isHardDeletingResource}
      />

      {/* Delete Quiz Set Dialogs */}
      <DeleteQuizSetDialog
        open={!!deleteQuizSetId}
        onOpenChange={(open) => !open && setDeleteQuizSetId(null)}
        onConfirm={handleDeleteQuizSet}
        isLoading={isDeletingQuiz}
      />

      <HardDeleteQuizSetDialog
        open={!!hardDeleteQuizSetId}
        onOpenChange={(open) => !open && setHardDeleteQuizSetId(null)}
        onConfirm={handleHardDeleteQuizSet}
        isLoading={isHardDeletingQuiz}
      />
    </div>
  );
}

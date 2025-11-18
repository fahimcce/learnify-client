"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useGetCourseByIdQuery,
  Course,
} from "@/redux/features/course/course.api";
import {
  useEnrollInCourseMutation,
  useGetMyEnrollmentsQuery,
  Enrollment,
} from "@/redux/features/enrollment/enrollment.api";
import { useGetCourseResourcesQuery } from "@/redux/features/courseResource/courseResource.api";
import {
  useGetMyCourseNotesQuery,
  useDeleteMyNoteMutation,
  useHardDeleteMyNoteMutation,
  Note,
} from "@/redux/features/note/note.api";
import {
  useGetMyLearningPathsQuery,
  useGenerateLearningPathMutation,
  useRegenerateLearningPathMutation,
  LearningPath,
} from "@/redux/features/learningPath/learningPath.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Loader2,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  Sparkles,
  ExternalLink,
  PlayCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  StickyNote,
  Plus,
  Edit,
  Trash2,
  File,
  Target,
  RefreshCw,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import NoteCard from "@/components/note/NoteCard";
import CreateNoteDialog from "@/components/note/CreateNoteDialog";
import NoteDetailDialog from "@/components/note/NoteDetailDialog";
import { ResourcesTab } from "../_components/ResourcesTab";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [userLevel, setUserLevel] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<
    "learning-path" | "notes" | "resources" | null
  >(null);
  const [noteTypeFilter, setNoteTypeFilter] = useState<string>("all");
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [hardDeleteNoteId, setHardDeleteNoteId] = useState<string | null>(null);
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [viewNoteId, setViewNoteId] = useState<string | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  const { data: course, isLoading, error } = useGetCourseByIdQuery(courseId);
  const { data: enrollments } = useGetMyEnrollmentsQuery();
  const [enrollInCourse, { isLoading: isEnrolling }] =
    useEnrollInCourseMutation();

  // Check if user is enrolled
  const enrollment = enrollments?.find(
    (e: Enrollment) => e.courseId && e.courseId._id === courseId && !e.isDeleted
  );

  // Only fetch resources if user is enrolled and resources tab is active
  const { data: resources } = useGetCourseResourcesQuery(
    { courseId },
    { skip: !enrollment || activeTab !== "resources" }
  );

  // Fetch notes when notes tab is active
  const {
    data: notes,
    isLoading: isLoadingNotes,
    refetch: refetchNotes,
  } = useGetMyCourseNotesQuery(
    {
      courseId,
      noteType: noteTypeFilter !== "all" ? (noteTypeFilter as any) : undefined,
    },
    { skip: activeTab !== "notes" }
  );

  // Fetch learning paths
  const {
    data: learningPaths,
    isLoading: isLoadingPaths,
    refetch: refetchLearningPaths,
  } = useGetMyLearningPathsQuery();
  const [generateLearningPath, { isLoading: isGenerating }] =
    useGenerateLearningPathMutation();
  const [regenerateLearningPath, { isLoading: isRegenerating }] =
    useRegenerateLearningPathMutation();

  // Find learning path for this course
  const courseLearningPath = learningPaths?.find(
    (path: LearningPath) => path.courseId?._id === courseId && !path.isDeleted
  );
  const [deleteNote, { isLoading: isDeleting }] = useDeleteMyNoteMutation();
  const [hardDeleteNote, { isLoading: isHardDeleting }] =
    useHardDeleteMyNoteMutation();

  const notesArray = Array.isArray(notes) ? notes : [];

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
        return <FileText className="h-5 w-5" />;
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <StickyNote className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pdf":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
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

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return;
    try {
      await deleteNote(deleteNoteId).unwrap();
      toast.success("Note deleted successfully!");
      setDeleteNoteId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete note. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleHardDeleteNote = async () => {
    if (!hardDeleteNoteId) return;
    try {
      await hardDeleteNote(hardDeleteNoteId).unwrap();
      toast.success("Note permanently deleted!");
      setHardDeleteNoteId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete note. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEnroll = async () => {
    try {
      await enrollInCourse({
        courseId,
        userLevel: userLevel || undefined,
      }).unwrap();
      toast.success("Successfully enrolled in course!");
      setIsEnrollDialogOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to enroll in course. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleGenerateLearningPath = async () => {
    if (!course) return;
    try {
      await generateLearningPath({
        courseCode: course.courseCode,
      }).unwrap();
      toast.success("Learning path generated successfully!");
      await refetchLearningPaths();
      setActiveTab("learning-path");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to generate learning path. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleRegenerateLearningPath = async () => {
    if (!selectedPathId || !course) return;
    try {
      await regenerateLearningPath({
        previousPathId: selectedPathId,
        courseCode: course.courseCode,
      }).unwrap();
      toast.success("Learning path regenerated successfully!");
      await refetchLearningPaths();
      setShowRegenerateDialog(false);
      setSelectedPathId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to regenerate learning path. Please try again.";
      toast.error(errorMessage);
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
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">
              Failed to load course. The course may not exist or you may not
              have access to it.
            </p>
            <Link href="/user/courses">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/user/courses">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      {/* Enrollment Status Banner */}
      {enrollment && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">You are enrolled in this course</p>
                <p className="text-sm text-muted-foreground">
                  Status: {enrollment.status}
                </p>
              </div>
            </div>
            <Link href={`/user/enrollments/${enrollment._id}`}>
              <Button variant="outline" size="sm">
                View Enrollment
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl">
                    {course.courseName}
                  </CardTitle>
                </div>
                <CardDescription className="font-mono text-lg mt-2">
                  {course.courseCode}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons / Tabs */}
      {!enrollment ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button
            size="lg"
            className="w-full"
            onClick={() => setIsEnrollDialogOpen(true)}
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            Enroll in Course
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 border-b">
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-b-none border-b-2",
                    activeTab === "learning-path"
                      ? "border-primary text-primary"
                      : "border-transparent"
                  )}
                  onClick={() => setActiveTab("learning-path")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Learning Path
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-b-none border-b-2",
                    activeTab === "notes"
                      ? "border-primary text-primary"
                      : "border-transparent"
                  )}
                  onClick={() => setActiveTab("notes")}
                >
                  <StickyNote className="mr-2 h-4 w-4" />
                  View Notes
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-b-none border-b-2",
                    activeTab === "resources"
                      ? "border-primary text-primary"
                      : "border-transparent"
                  )}
                  onClick={() => setActiveTab("resources")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tab Content */}
      {enrollment && activeTab && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Learning Path Tab */}
          {activeTab === "learning-path" && (
            <Card>
              <CardContent className="pt-6">
                {isLoadingPaths ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !courseLearningPath ? (
                  <div className="text-center py-12">
                    <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Learning Path Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Generate a personalized AI-powered learning path for this
                      course. This will create a step-by-step guide tailored to
                      help you master {course.courseName}.
                    </p>
                    <Button
                      onClick={handleGenerateLearningPath}
                      disabled={isGenerating}
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Learning Path...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Learning Path
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Learning Path Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">
                          {courseLearningPath.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {courseLearningPath.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPathId(courseLearningPath._id);
                          setShowRegenerateDialog(true);
                        }}
                        disabled={isRegenerating}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-sm text-muted-foreground">
                            {courseLearningPath.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Difficulty</p>
                          <Badge variant="outline" className="mt-1">
                            {courseLearningPath.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Steps</p>
                          <p className="text-sm text-muted-foreground">
                            {courseLearningPath.steps.length} steps
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {courseLearningPath.prerequisites &&
                      courseLearningPath.prerequisites.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Prerequisites</h4>
                          <ul className="list-disc list-inside space-y-2">
                            {courseLearningPath.prerequisites.map(
                              (prereq, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground"
                                >
                                  {prereq}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Learning Outcomes */}
                    {courseLearningPath.outcomes &&
                      courseLearningPath.outcomes.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">
                            Learning Outcomes
                          </h4>
                          <ul className="list-disc list-inside space-y-2">
                            {courseLearningPath.outcomes.map(
                              (outcome, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground"
                                >
                                  {outcome}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Learning Steps */}
                    <div>
                      <h4 className="font-semibold mb-4">Learning Steps</h4>
                      <div className="space-y-6">
                        {courseLearningPath.steps.map((step, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-primary pl-4 py-2"
                          >
                            <div className="flex items-start gap-3">
                              <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                {step.stepNumber}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-lg">
                                  {step.title}
                                </h5>
                                <p className="text-muted-foreground mt-1">
                                  {step.description}
                                </p>
                                <div className="mt-3 space-y-2">
                                  {step.learningObjectives &&
                                    step.learningObjectives.length > 0 && (
                                      <div>
                                        <p className="text-sm font-medium">
                                          Learning Objectives:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                          {step.learningObjectives.map(
                                            (obj, idx) => (
                                              <li key={idx}>{obj}</li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  {step.resources &&
                                    step.resources.length > 0 && (
                                      <div>
                                        <p className="text-sm font-medium">
                                          Resources:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                          {step.resources.map(
                                            (resource, idx) => (
                                              <li key={idx}>{resource}</li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      Estimated time: {step.estimatedTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Course Notes</CardTitle>
                  <CardDescription>
                    {notesArray.length} note
                    {notesArray.length !== 1 ? "s" : ""} available for this
                    course
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {/* Notes Grid */}
                {isLoadingNotes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : notesArray.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {notesArray.map((note: Note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        getNoteTypeIcon={getNoteTypeIcon}
                        getNoteTypeColor={getNoteTypeColor}
                        formatFileSize={formatFileSize}
                        onView={() => setViewNoteId(note._id)}
                        onEdit={() => {
                          setEditNoteId(note._id);
                          setIsCreateNoteDialogOpen(true);
                        }}
                        onDelete={() => setDeleteNoteId(note._id)}
                        onHardDelete={() => setHardDeleteNoteId(note._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <StickyNote className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No course notes found
                    </h3>
                    <p className="text-muted-foreground">
                      No notes are available for this course yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <ResourcesTab
              resources={resources || []}
              getResourceTypeIcon={getResourceTypeIcon}
              formatFileSize={formatFileSize}
            />
          )}
        </motion.div>
      )}

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog
        open={!!deleteNoteId}
        onOpenChange={(open) => !open && setDeleteNoteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the note. The note can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
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

      {/* Hard Delete Note Confirmation Dialog */}
      <AlertDialog
        open={!!hardDeleteNoteId}
        onOpenChange={(open) => !open && setHardDeleteNoteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note and its file from the database and filesystem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHardDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHardDeleteNote}
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

      {/* Create/Edit Note Dialog */}
      <CreateNoteDialog
        open={isCreateNoteDialogOpen}
        onOpenChange={(open) => {
          setIsCreateNoteDialogOpen(open);
          if (!open) {
            setEditNoteId(null); // Reset edit mode when dialog closes
          }
        }}
        courseId={courseId}
        courseName={course?.courseName}
        editNoteId={editNoteId || undefined}
        onSuccess={() => {
          // Refetch notes after successful creation/update
          if (activeTab === "notes") {
            refetchNotes();
          }
          setEditNoteId(null); // Reset edit mode after success
        }}
      />

      {/* Note Detail Dialog */}
      <NoteDetailDialog
        open={!!viewNoteId}
        onOpenChange={(open) => {
          if (!open) {
            setViewNoteId(null);
          }
        }}
        noteId={viewNoteId}
        onEdit={() => {
          if (viewNoteId) {
            setViewNoteId(null);
            setEditNoteId(viewNoteId);
            setIsCreateNoteDialogOpen(true);
          }
        }}
      />

      {/* Regenerate Learning Path Dialog */}
      <AlertDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Learning Path?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new learning path for this course. The
              previous path will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRegenerating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateLearningPath}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Regenerate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Course</DialogTitle>
            <DialogDescription>
              Set your skill level for this course (1-10). This helps us
              personalize your learning experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userLevel">Your Skill Level (1-10)</Label>
              <Input
                id="userLevel"
                type="number"
                min="1"
                max="10"
                value={userLevel}
                onChange={(e) => setUserLevel(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                1-3: Beginner • 4-6: Intermediate • 7-8: Advanced • 9-10: Expert
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEnrollDialogOpen(false)}
              disabled={isEnrolling}
            >
              Cancel
            </Button>
            <Button onClick={handleEnroll} disabled={isEnrolling}>
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Enroll
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useGetMyNotesQuery,
  useDeleteMyNoteMutation,
  useHardDeleteMyNoteMutation,
  Note,
} from "@/redux/features/note/note.api";
import { useGetMyEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetAllCoursesQuery } from "@/redux/features/course/course.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Loader2,
  Plus,
  FileText,
  File,
  Image as ImageIcon,
  Trash2,
  Edit,
  BookOpen,
  StickyNote,
  ExternalLink,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import NoteCard from "@/components/note/NoteCard";
import CreateNoteDialog from "@/components/note/CreateNoteDialog";

export default function NotesPage() {
  const router = useRouter();
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [hardDeleteNoteId, setHardDeleteNoteId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);

  const { data: notes, isLoading, error, refetch } = useGetMyNotesQuery();
  const { data: enrollments } = useGetMyEnrollmentsQuery();
  const { data: courses } = useGetAllCoursesQuery();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteMyNoteMutation();
  const [hardDeleteNote, { isLoading: isHardDeleting }] =
    useHardDeleteMyNoteMutation();

  const notesArray = Array.isArray(notes) ? notes : [];
  const randomNotes = notesArray.filter((note) => !note.courseId);
  const courseNotes = notesArray.filter((note) => note.courseId);

  // Get enrolled courses
  const coursesArray = Array.isArray(courses) ? courses : [];
  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
  const enrolledCourses = coursesArray.filter((course) =>
    enrollmentsArray.some(
      (enrollment) =>
        enrollment.courseId &&
        enrollment.courseId._id === course._id &&
        !enrollment.isDeleted
    )
  );

  // Group course notes by course
  const courseNotesByCourse = courseNotes.reduce((acc, note) => {
    if (!note.courseId) return acc;
    const courseId = note.courseId._id;
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  // Create a map of enrolled courses with their note counts
  const enrolledCoursesWithNotes = enrolledCourses.map((course) => ({
    course,
    noteCount: courseNotesByCourse[course._id]?.length || 0,
  }));

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

  const handleDelete = async () => {
    if (!deleteNoteId) return;
    try {
      await deleteNote(deleteNoteId).unwrap();
      toast.success("Note deleted successfully!");
      setDeleteNoteId(null);
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete note. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleHardDelete = async () => {
    if (!hardDeleteNoteId) return;
    try {
      await hardDeleteNote(hardDeleteNoteId).unwrap();
      toast.success("Note permanently deleted!");
      setHardDeleteNoteId(null);
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete note. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              Failed to load notes. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal notes and course-specific notes
        </p>
      </div>

      {/* Accordions */}
      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Course Notes Accordion */}
        <AccordionItem value="course-notes" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span className="text-lg font-semibold">Course Notes</span>
                <Badge variant="secondary" className="ml-2">
                  {courseNotes.length}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {enrolledCoursesWithNotes.length > 0 ? (
                <div className="space-y-3">
                  {enrolledCoursesWithNotes.map(({ course, noteCount }) => (
                    <Card
                      key={course._id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        router.push(`/user/notes/course/${course._id}`)
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-semibold">
                                {course.courseName}
                              </h3>
                              <p className="text-sm text-muted-foreground font-mono">
                                {course.courseCode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {noteCount} note{noteCount !== 1 ? "s" : ""}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No enrolled courses found. Enroll in a course to create
                    course notes.
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Others (Random) Notes Accordion */}
        <AccordionItem value="others" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                <span className="text-lg font-semibold">Others</span>
                <Badge variant="secondary" className="ml-2">
                  {randomNotes.length}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              </div>

              {randomNotes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {randomNotes.map((note: Note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      getNoteTypeIcon={getNoteTypeIcon}
                      getNoteTypeColor={getNoteTypeColor}
                      formatFileSize={formatFileSize}
                      onEdit={() => setEditNoteId(note._id)}
                      onDelete={() => setDeleteNoteId(note._id)}
                      onHardDelete={() => setHardDeleteNoteId(note._id)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <StickyNote className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No notes found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Get started by creating your first note!
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Delete Confirmation Dialog */}
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
              onClick={handleDelete}
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
              onClick={handleHardDelete}
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
        open={isCreateDialogOpen || !!editNoteId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditNoteId(null);
          }
        }}
        editNoteId={editNoteId || undefined}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

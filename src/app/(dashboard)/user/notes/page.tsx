"use client";

import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const router = useRouter();
  const [noteTypeFilter, setNoteTypeFilter] = useState<string>("all");
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [hardDeleteNoteId, setHardDeleteNoteId] = useState<string | null>(null);

  const {
    data: notes,
    isLoading,
    error,
  } = useGetMyNotesQuery(
    noteTypeFilter !== "all" ? { noteType: noteTypeFilter as any } : undefined
  );
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
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete note. Please try again.";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal notes and course-specific notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/user/notes/random")}>
            <StickyNote className="mr-2 h-4 w-4" />
            Random Notes
          </Button>
          {enrolledCourses.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Create Note</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/user/notes/create")}
                >
                  <StickyNote className="mr-2 h-4 w-4" />
                  Random Note
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Course Notes</DropdownMenuLabel>
                {enrolledCourses.map((course) => (
                  <DropdownMenuItem
                    key={course._id}
                    onClick={() =>
                      router.push(`/user/notes/create?courseId=${course._id}`)
                    }
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{course.courseName}</span>
                      <span className="text-xs text-muted-foreground">
                        {course.courseCode}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push("/user/notes/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter notes by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium mb-2 block">Note Type</label>
            <select
              value={noteTypeFilter}
              onChange={(e) => setNoteTypeFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All Types</option>
              <option value="text">Text Notes</option>
              <option value="pdf">PDF Notes</option>
              <option value="image">Image Notes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Random Notes Section */}
      {randomNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Random Notes</h2>
            <Link href="/user/notes/random">
              <Button variant="outline" size="sm">
                View All ({randomNotes.length})
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {randomNotes.slice(0, 6).map((note: Note) => (
              <NoteCardComponent
                key={note._id}
                note={note}
                getNoteTypeIcon={getNoteTypeIcon}
                getNoteTypeColor={getNoteTypeColor}
                formatFileSize={formatFileSize}
                onEdit={() => router.push(`/user/notes/${note._id}`)}
                onDelete={() => setDeleteNoteId(note._id)}
                onHardDelete={() => setHardDeleteNoteId(note._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses Quick Actions */}
      {enrolledCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Create Course Notes</CardTitle>
            <CardDescription>
              Create notes for your enrolled courses quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <Button
                  key={course._id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-start justify-start"
                  onClick={() =>
                    router.push(`/user/notes/create?courseId=${course._id}`)
                  }
                >
                  <div className="flex items-center gap-2 w-full">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-left flex-1">
                      {course.courseName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 font-mono">
                    {course.courseCode}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Notes Section */}
      {courseNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Course Notes</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courseNotes.slice(0, 6).map((note: Note) => (
              <NoteCardComponent
                key={note._id}
                note={note}
                getNoteTypeIcon={getNoteTypeIcon}
                getNoteTypeColor={getNoteTypeColor}
                formatFileSize={formatFileSize}
                onEdit={() => router.push(`/user/notes/${note._id}`)}
                onDelete={() => setDeleteNoteId(note._id)}
                onHardDelete={() => setHardDeleteNoteId(note._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notesArray.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <StickyNote className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first note!
              </p>
              <Button onClick={() => router.push("/user/notes/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}

// Note Card Component
function NoteCardComponent({
  note,
  getNoteTypeIcon,
  getNoteTypeColor,
  formatFileSize,
  onEdit,
  onDelete,
  onHardDelete,
}: {
  note: Note;
  getNoteTypeIcon: (type: string) => React.ReactElement;
  getNoteTypeColor: (type: string) => string;
  formatFileSize: (bytes?: number) => string;
  onEdit?: () => void;
  onDelete?: () => void;
  onHardDelete?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {getNoteTypeIcon(note.noteType)}
            </div>
            <Badge className={getNoteTypeColor(note.noteType)}>
              {note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)}
            </Badge>
          </div>
          <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
          {note.courseId && (
            <CardDescription className="mt-1 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {note.courseId.courseName} ({note.courseId.courseCode})
            </CardDescription>
          )}
          {note.content && (
            <CardDescription className="mt-2 line-clamp-2">
              {note.content}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            {/* File Info */}
            {(note.fileSize || note.fileName) && (
              <div className="text-sm text-muted-foreground">
                {note.fileName && (
                  <div className="font-medium">{note.fileName}</div>
                )}
                {note.fileSize && (
                  <div>Size: {formatFileSize(note.fileSize)}</div>
                )}
              </div>
            )}

            {/* Created Date */}
            <div className="text-xs text-muted-foreground">
              Created: {new Date(note.createdAt).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t mt-auto space-y-2">
              {note.fileUrl && (
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}${note.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <Button className="w-full" variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {note.noteType === "pdf" ? "View PDF" : "View Image"}
                  </Button>
                </a>
              )}
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

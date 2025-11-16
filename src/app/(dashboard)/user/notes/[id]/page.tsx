"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  useGetMyNoteByIdQuery,
  useUpdateMyNoteMutation,
  useDeleteMyNoteMutation,
} from "@/redux/features/note/note.api";
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
  Loader2,
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  StickyNote,
  FileText,
  Image as ImageIcon,
  BookOpen,
  ExternalLink,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: note,
    isLoading,
    error,
  } = useGetMyNoteByIdQuery(noteId);
  const [updateNote, { isLoading: isUpdating }] = useUpdateMyNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteMyNoteMutation();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
    }
  }, [note]);

  const handleSave = async () => {
    if (!note) return;

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      await updateNote({
        id: noteId,
        data: {
          title,
          content: note.noteType === "text" ? content : undefined,
        },
      }).unwrap();
      toast.success("Note updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update note. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    try {
      await deleteNote(noteId).unwrap();
      toast.success("Note deleted successfully!");
      if (note.courseId) {
        router.push(`/user/notes/course/${note.courseId._id}`);
      } else {
        router.push("/user/notes/random");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete note. Please try again.";
      toast.error(errorMessage);
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
        return <StickyNote className="h-5 w-5" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">
              Failed to load note.
            </p>
            <Link href="/user/notes">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Notes
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
      <Link
        href={
          note.courseId
            ? `/user/notes/course/${note.courseId._id}`
            : "/user/notes/random"
        }
      >
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title"
                    />
                  </div>
                  {note.noteType === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter note content"
                        rows={10}
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isUpdating}
                      size="sm"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setTitle(note.title);
                        setContent(note.content || "");
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getNoteTypeIcon(note.noteType)}
                    <CardTitle className="text-2xl">{note.title}</CardTitle>
                    <Badge className={getNoteTypeColor(note.noteType)}>
                      {note.noteType.charAt(0).toUpperCase() +
                        note.noteType.slice(1)}
                    </Badge>
                  </div>
                  {note.courseId && (
                    <CardDescription className="mt-2 flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {note.courseId.courseName} ({note.courseId.courseCode})
                    </CardDescription>
                  )}
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Content */}
            {note.noteType === "text" && note.content && !isEditing && (
              <div className="prose max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            )}

            {/* File Note */}
            {note.noteType !== "text" && note.fileUrl && (
              <div className="space-y-4">
                {note.fileName && (
                  <div>
                    <p className="text-sm font-medium mb-1">File Name</p>
                    <p className="text-sm text-muted-foreground">
                      {note.fileName}
                    </p>
                  </div>
                )}
                {note.fileSize && (
                  <div>
                    <p className="text-sm font-medium mb-1">File Size</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(note.fileSize)}
                    </p>
                  </div>
                )}
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}${note.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {note.noteType === "pdf" ? "View PDF" : "View Image"}
                  </Button>
                </a>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
    </div>
  );
}


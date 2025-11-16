"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetMyNoteByIdQuery,
  Note,
} from "@/redux/features/note/note.api";
import {
  Loader2,
  StickyNote,
  FileText,
  Image as ImageIcon,
  BookOpen,
  ExternalLink,
  Calendar,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NoteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string | null;
  onEdit?: () => void;
}

export default function NoteDetailDialog({
  open,
  onOpenChange,
  noteId,
  onEdit,
}: NoteDetailDialogProps) {
  const {
    data: note,
    isLoading,
    error,
  } = useGetMyNoteByIdQuery(noteId || "", {
    skip: !noteId || !open,
  });

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <StickyNote className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Loading Note</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !note) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load note details. Please try again.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{note.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <Badge className={getNoteTypeColor(note.noteType)}>
                  <div className="flex items-center gap-1">
                    {getNoteTypeIcon(note.noteType)}
                    <span>
                      {note.noteType.charAt(0).toUpperCase() +
                        note.noteType.slice(1)}
                    </span>
                  </div>
                </Badge>
                {note.courseId && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {note.courseId.courseName} ({note.courseId.courseCode})
                  </Badge>
                )}
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <StickyNote className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(note.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Updated:{" "}
                  {formatDistanceToNow(new Date(note.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Content for text notes */}
          {note.noteType === "text" && note.content && (
            <div className="prose max-w-none">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            </div>
          )}

          {/* File info for file notes */}
          {note.noteType !== "text" && (
            <div className="space-y-4">
              {(note.fileName || note.fileSize) && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  {note.fileName && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">File Name:</span>
                      <span>{note.fileName}</span>
                    </div>
                  )}
                  {note.fileSize && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">File Size:</span>
                      <span>{formatFileSize(note.fileSize)}</span>
                    </div>
                  )}
                </div>
              )}

              {note.fileUrl && (
                <div className="flex justify-center">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}${note.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="default">
                      <ExternalLink className="mr-2 h-5 w-5" />
                      {note.noteType === "pdf" ? "View PDF" : "View Image"}
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


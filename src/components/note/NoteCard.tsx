"use client";

import React from "react";
import { motion } from "framer-motion";
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
  StickyNote,
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
  Edit,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Note } from "@/redux/features/note/note.api";

interface NoteCardProps {
  note: Note;
  getNoteTypeIcon: (type: string) => React.ReactElement;
  getNoteTypeColor: (type: string) => string;
  formatFileSize: (bytes?: number) => string;
  onEdit?: () => void;
  onDelete?: () => void;
  onHardDelete?: () => void;
  onView?: () => void;
}

export default function NoteCard({
  note,
  getNoteTypeIcon,
  getNoteTypeColor,
  formatFileSize,
  onEdit,
  onDelete,
  onHardDelete,
  onView,
}: NoteCardProps) {
  const isTextNote = note.noteType === "text";
  const handleTitleClick = () => {
    if (isTextNote && onView) {
      onView();
    }
  };

  const handleContentClick = () => {
    if (isTextNote && onView) {
      onView();
    }
  };
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
          <CardTitle
            className={`text-lg line-clamp-2 ${
              isTextNote && onView
                ? "cursor-pointer hover:underline transition-all"
                : ""
            }`}
            onClick={handleTitleClick}
          >
            {note.title}
          </CardTitle>
          {note.courseId && (
            <CardDescription className="mt-1 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {note.courseId.courseName} ({note.courseId.courseCode})
            </CardDescription>
          )}
          {note.content && (
            <CardDescription
              className={`mt-2 line-clamp-2 ${
                isTextNote && onView
                  ? "cursor-pointer hover:underline transition-all"
                  : ""
              }`}
              onClick={handleContentClick}
            >
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

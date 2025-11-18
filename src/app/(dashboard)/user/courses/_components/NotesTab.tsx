"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, StickyNote } from "lucide-react";
import { Note } from "@/redux/features/note/note.api";
import NoteCard from "@/components/note/NoteCard";
import { Course } from "@/redux/features/course/course.api";

interface NotesTabProps {
  notes: Note[];
  isLoading: boolean;
  course: Course;
  onViewNote: (id: string) => void;
  onEditNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onHardDeleteNote: (id: string) => void;
  getNoteTypeIcon: (type: string) => React.ReactElement;
  getNoteTypeColor: (type: string) => string;
  formatFileSize: (bytes?: number) => string;
}

export function NotesTab({
  notes,
  isLoading,
  course,
  onViewNote,
  onEditNote,
  onDeleteNote,
  onHardDeleteNote,
  getNoteTypeIcon,
  getNoteTypeColor,
  formatFileSize,
}: NotesTabProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Course Notes</CardTitle>
          <CardDescription>
            {notes.length} note{notes.length !== 1 ? "s" : ""} available for
            this course
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note: Note) => (
              <NoteCard
                key={note._id}
                note={note}
                getNoteTypeIcon={getNoteTypeIcon}
                getNoteTypeColor={getNoteTypeColor}
                formatFileSize={formatFileSize}
                onView={() => onViewNote(note._id)}
                onEdit={() => onEditNote(note._id)}
                onDelete={() => onDeleteNote(note._id)}
                onHardDelete={() => onHardDeleteNote(note._id)}
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
  );
}

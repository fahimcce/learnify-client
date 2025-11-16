"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateTextNoteMutation,
  useCreateFileNoteMutation,
  useGetMyNoteByIdQuery,
  useUpdateMyNoteMutation,
} from "@/redux/features/note/note.api";
import {
  Loader2,
  StickyNote,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string;
  courseName?: string;
  editNoteId?: string; // If provided, dialog is in edit mode
  onSuccess?: () => void;
}

export default function CreateNoteDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
  editNoteId,
  onSuccess,
}: CreateNoteDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editNoteId;
  const [noteType, setNoteType] = useState<"text" | "file">("text");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const [createTextNote, { isLoading: isCreatingText }] =
    useCreateTextNoteMutation();
  const [createFileNote, { isLoading: isCreatingFile }] =
    useCreateFileNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateMyNoteMutation();

  // Fetch note data when in edit mode
  const { data: editNote, isLoading: isLoadingNote } = useGetMyNoteByIdQuery(
    editNoteId || "",
    {
      skip: !editNoteId || !open,
    }
  );

  // Load note data when editing
  useEffect(() => {
    if (open && editNote) {
      setTitle(editNote.title);
      setContent(editNote.content || "");
      setNoteType(
        editNote.noteType === "pdf" || editNote.noteType === "image"
          ? "file"
          : "text"
      );
    }
  }, [open, editNote]);

  // Reset form when dialog opens/closes (only for create mode)
  useEffect(() => {
    if (!open) {
      if (!isEditMode) {
        setNoteType("text");
        setTitle("");
        setContent("");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  }, [open, isEditMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Validate file type
      const isPDF = selectedFile.type === "application/pdf";
      const isImage = selectedFile.type.startsWith("image/");

      if (!isPDF && !isImage) {
        toast.error("Please select a PDF or image file");
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      if (!title.trim()) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      if (isEditMode) {
        // Update existing note (only title and content can be updated)
        if (!editNoteId) return;
        await updateNote({
          id: editNoteId,
          data: {
            title,
            content: noteType === "text" ? content : undefined,
          },
        }).unwrap();
        toast.success("Note updated successfully!");
      } else {
        // Create new note
        if (noteType === "text") {
          // Create text note
          await createTextNote({
            title,
            content: content || undefined,
            courseId: courseId || undefined,
          }).unwrap();
          toast.success("Text note created successfully!");
        } else {
          // Create file note
          if (!file) {
            toast.error("Please select a file");
            return;
          }
          await createFileNote({
            file,
            title,
            courseId: courseId || undefined,
          }).unwrap();
          toast.success("File note created successfully!");
        }
      }

      // Reset form (only for create mode)
      if (!isEditMode) {
        setTitle("");
        setContent("");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      // Close dialog
      onOpenChange(false);

      // Call onSuccess callback to refresh notes
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        `Failed to ${isEditMode ? "update" : "create"} note. Please try again.`;
      toast.error(errorMessage);
    }
  };

  if (isEditMode && isLoadingNote) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="custom-dialog-width max-h-[90vh] overflow-y-auto">
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="custom-dialog-width max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Note" : "Create Note"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your note title and content"
              : courseId && courseName
              ? `Create a note for ${courseName}`
              : "Create a new text note or upload a file note"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Info (if provided) */}
          {!isEditMode && courseId && courseName && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
              <p className="text-sm font-medium text-primary">
                Creating note for: {courseName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This note will be associated with the course.
              </p>
            </div>
          )}

          {/* Show course info in edit mode if note has a course */}
          {isEditMode && editNote?.courseId && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
              <p className="text-sm font-medium text-primary">
                Course: {editNote.courseId.courseName} (
                {editNote.courseId.courseCode})
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This note is associated with this course.
              </p>
            </div>
          )}

          {/* Note Type Selection (disabled in edit mode) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label>Note Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNoteType("text")}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    noteType === "text"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <StickyNote className="h-5 w-5 mb-2" />
                  <h3 className="font-semibold text-sm">Text Note</h3>
                  <p className="text-xs text-muted-foreground">
                    Create a text-based note
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType("file")}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    noteType === "file"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Upload className="h-5 w-5 mb-2" />
                  <h3 className="font-semibold text-sm">File Note</h3>
                  <p className="text-xs text-muted-foreground">
                    Upload PDF or image
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Show note type info in edit mode */}
          {isEditMode && editNote && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Note Type:</Label>
                <Badge variant="outline">
                  {editNote.noteType.charAt(0).toUpperCase() +
                    editNote.noteType.slice(1)}
                </Badge>
                {editNote.noteType !== "text" && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (File cannot be changed)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
            />
          </div>

          {/* Content (for text notes) */}
          {noteType === "text" && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content (optional)"
                rows={8}
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          )}

          {/* File Upload (for file notes) - only in create mode */}
          {noteType === "file" && !isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="file">
                File <span className="text-destructive">*</span> (PDF or Image,
                Max 10MB)
              </Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                required
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  {file.type === "application/pdf" ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Show existing file info in edit mode for file notes */}
          {isEditMode && editNote && editNote.noteType !== "text" && (
            <div className="space-y-2">
              <Label>Current File</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded">
                {editNote.noteType === "pdf" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                <span className="text-sm flex-1">
                  {editNote.fileName || "File"}
                </span>
                {editNote.fileSize && (
                  <span className="text-xs text-muted-foreground">
                    ({(editNote.fileSize / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
                {editNote.fileUrl && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}${editNote.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2"
                  >
                    <Button variant="outline" size="sm" type="button">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                File cannot be changed. Only title can be updated for file
                notes.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingText || isCreatingFile || isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreatingText || isCreatingFile || isUpdating}
            >
              {isCreatingText || isCreatingFile || isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <StickyNote className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Note" : "Create Note"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

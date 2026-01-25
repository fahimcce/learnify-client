"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useExtractQuestionsMutation } from "@/redux/features/ocr/ocr.api";
import { Loader2, Upload, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ExtractedQuestion } from "@/redux/features/ocr/ocr.api";

interface OCRQuestionExtractorProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
  onClose?: () => void;
  type: string;
}

export function OCRQuestionExtractor({
  onQuestionsExtracted,
  onClose,
  type,
}: OCRQuestionExtractorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractQuestions, { isLoading }] = useExtractQuestionsMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please select image files");
      return;
    }

    // Limit to 10 images
    const filesToAdd = imageFiles.slice(0, 10 - selectedFiles.length);
    setSelectedFiles((prev) => [...prev, ...filesToAdd]);

    // Create previews
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      const questions = await extractQuestions({
        files: selectedFiles,
        type,
      }).unwrap();
      toast.success(
        `Successfully extracted ${questions.length} question(s) from ${selectedFiles.length} image(s)`,
      );
      onQuestionsExtracted(questions);
      // Reset
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to extract questions from images. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>
          Upload images containing questions. AI will extract them
          automatically.
        </span>
      </div>

      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="ocr-images">Upload Images (Max 10)</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedFiles.length >= 10 || isLoading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Images
          </Button>
          <input
            ref={fileInputRef}
            id="ocr-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={selectedFiles.length >= 10 || isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: JPEG, PNG, GIF, WebP (Max 10MB per image)
        </p>
      </div>

      {/* Preview Selected Images */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Images ({selectedFiles.length}/10)</Label>
          <div className="grid grid-cols-3 gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted">
                  {previews[index] && (
                    <img
                      src={previews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extract Button */}
      {selectedFiles.length > 0 && (
        <Button
          type="button"
          onClick={handleExtract}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting Questions...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Extract Questions from Images
            </>
          )}
        </Button>
      )}

      {selectedFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            No images selected. Click "Select Images" to upload.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon, FileText } from "lucide-react";

// Tailwind gradient classes - extracted to avoid linter false positives
const GRADIENT_PREVIEW = "bg-gradient-to-r from-indigo-50 to-purple-50";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");

  return (
    <div className={`px-4 py-3 ${GRADIENT_PREVIEW} border-t border-slate-200 flex items-center gap-3`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm">
        {isImage ? (
          <ImageIcon className="h-5 w-5 text-indigo-600" />
        ) : (
          <FileText className="h-5 w-5 text-indigo-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}


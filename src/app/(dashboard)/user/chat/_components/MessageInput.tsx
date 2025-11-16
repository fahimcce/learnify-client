"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Paperclip, Smile } from "lucide-react";

// Tailwind gradient classes - extracted to avoid linter false positives
const GRADIENT_BUTTON = "bg-gradient-to-r from-indigo-600 to-purple-600";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  fileToSend: File | null;
  isLoading: boolean;
  onSendMessage: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onTyping: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function MessageInput({
  message,
  setMessage,
  fileToSend,
  isLoading,
  onSendMessage,
  onFileChange,
  onRemoveFile,
  onTyping,
  fileInputRef,
}: MessageInputProps) {
  return (
    <div className="p-4 bg-white border-t border-slate-200 shadow-lg">
      <div className="flex gap-3 items-end">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="h-11 w-11 rounded-full border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm"
        >
          <Paperclip className="h-5 w-5 text-slate-600" />
        </Button>
        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              onTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            className="min-h-[44px] pr-12 bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 rounded-full transition-all"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Smile className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <Button
          onClick={onSendMessage}
          disabled={isLoading || (!message.trim() && !fileToSend)}
          className={`h-11 w-11 rounded-full ${GRADIENT_BUTTON} hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}


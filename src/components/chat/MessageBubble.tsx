"use client";

import React from "react";
import { ChatMessage } from "@/redux/features/chat/chat.api";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = false,
  showName = false,
}: MessageBubbleProps) {
  const getStatusIcon = () => {
    switch (message.status) {
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      default:
        return <Loader2 className="h-3 w-3 animate-spin text-gray-400" />;
    }
  };

  if (message.messageType === "text") {
    return (
      <div
        className={cn(
          "flex gap-2 max-w-[70%]",
          isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
        )}
      >
        {showAvatar && !isOwn && (
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {message.senderId.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div
          className={cn(
            "rounded-lg px-4 py-2 shadow-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {showName && !isOwn && (
            <div className="text-xs font-semibold mb-1 opacity-70">
              {message.senderId.name}
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs opacity-70">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
            {isOwn && getStatusIcon()}
          </div>
        </div>
      </div>
    );
  }

  if (message.messageType === "image" || message.messageType === "pdf") {
    const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${message.fileUrl}`;
    const isImage = message.messageType === "image";

    return (
      <div
        className={cn(
          "flex gap-2 max-w-[70%]",
          isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
        )}
      >
        {showAvatar && !isOwn && (
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {message.senderId.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div
          className={cn(
            "rounded-lg overflow-hidden shadow-sm",
            isOwn ? "bg-primary/10" : "bg-muted"
          )}
        >
          {showName && !isOwn && (
            <div className="text-xs font-semibold px-3 pt-2 pb-1 opacity-70">
              {message.senderId.name}
            </div>
          )}
          <div className="p-2">
            {isImage ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={fileUrl}
                  alt={message.fileName || "Image"}
                  className="max-w-full h-auto rounded-md max-h-64 object-contain"
                />
              </a>
            ) : (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 hover:bg-background/50 rounded-md transition-colors"
              >
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {message.fileName || "Document"}
                  </p>
                  {message.fileSize && (
                    <p className="text-xs text-muted-foreground">
                      {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </a>
            )}
            <div className="flex items-center justify-end gap-1 mt-2 px-2">
              <span className="text-xs opacity-70">
                {format(new Date(message.createdAt), "HH:mm")}
              </span>
              {isOwn && getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

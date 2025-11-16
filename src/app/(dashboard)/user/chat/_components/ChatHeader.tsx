"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Circle } from "lucide-react";

// Tailwind gradient classes - extracted to avoid linter false positives
const GRADIENT_HEADER = "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600";

interface Participant {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ChatHeaderProps {
  otherParticipant: Participant | null;
}

export default function ChatHeader({ otherParticipant }: ChatHeaderProps) {
  if (!otherParticipant) return null;

  return (
    <div className={`hidden md:flex items-center gap-4 p-4 ${GRADIENT_HEADER} text-white shadow-lg`}>
      <Avatar className="ring-2 ring-offset-2 ring-white/30 h-12 w-12">
        <AvatarImage src="" />
        <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white font-semibold text-lg">
          {otherParticipant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold truncate">{otherParticipant.name}</h2>
          <div className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
            <span className="text-xs text-white/80">Online</span>
          </div>
        </div>
        {otherParticipant.email && (
          <p className="text-sm text-white/80 truncate">{otherParticipant.email}</p>
        )}
      </div>
    </div>
  );
}


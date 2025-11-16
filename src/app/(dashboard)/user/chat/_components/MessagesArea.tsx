"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, Conversation } from "@/redux/features/chat/chat.api";
import MessageBubble from "@/components/chat/MessageBubble";
import { Loader2, MessageSquare } from "lucide-react";

// Tailwind gradient classes - extracted to avoid linter false positives
const GRADIENT_BG = "bg-gradient-to-b from-slate-50/50 to-white";
const GRADIENT_ICON = "bg-gradient-to-br from-indigo-100 to-purple-100";

interface Participant {
  _id?: string;
  name: string;
  email?: string;
}

interface MessagesAreaProps {
  selectedConversation: Conversation | null;
  otherParticipant: Participant | null;
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  isTyping: boolean;
  currentUserId: string | undefined;
}

export default function MessagesArea({
  selectedConversation,
  otherParticipant,
  messages,
  isLoadingMessages,
  isTyping,
  currentUserId,
}: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedConversation || !otherParticipant) return null;

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${GRADIENT_BG}`}>
      {selectedConversation._id.startsWith("temp-") ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${GRADIENT_ICON} mb-6`}>
              <MessageSquare className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              New Conversation
            </h3>
            <p className="text-slate-600">
              Start chatting with{" "}
              <span className="font-semibold text-indigo-600">
                {otherParticipant.name}
              </span>
            </p>
          </div>
        </div>
      ) : isLoadingMessages ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading messages...</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${GRADIENT_ICON} mb-6`}>
              <MessageSquare className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No messages yet
            </h3>
            <p className="text-slate-600">Start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg: ChatMessage, index: number) => {
            const prevMessage = messages[index - 1];

            // Handle both string and object senderId
            const senderId =
              typeof msg.senderId === "string"
                ? msg.senderId
                : msg.senderId?._id || "";

            const prevSenderId = prevMessage
              ? typeof prevMessage.senderId === "string"
                ? prevMessage.senderId
                : prevMessage.senderId?._id || ""
              : null;

            // Compare senderId with currentUserId as strings to handle ObjectId vs string mismatches
            const senderIdStr = (senderId || "").toString();
            const currentIdStr = (currentUserId || "").toString();
            const isOwn = senderIdStr === currentIdStr;

            // Debug: Log if message alignment seems wrong (only for first message to avoid spam)
            if (index === 0) {
              console.log("First message alignment check:", {
                messageId: msg._id,
                senderId: senderIdStr,
                senderName:
                  typeof msg.senderId === "object" ? msg.senderId.name : "N/A",
                currentUserId: currentIdStr,
                isOwn,
                shouldBeOnRight: isOwn,
              });
            }

            const showAvatar = !prevMessage || prevSenderId !== senderId;
            const showName = showAvatar && !isOwn;

            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={isOwn}
                showAvatar={showAvatar}
                showName={showName}
              />
            );
          })}
          {isTyping && (
            <div className="flex gap-3 items-end">
              <div className={`w-10 h-10 rounded-full ${GRADIENT_ICON} flex items-center justify-center ring-2 ring-offset-2 ring-indigo-200`}>
                <span className="text-sm font-semibold text-indigo-600">
                  {otherParticipant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="rounded-2xl rounded-bl-md px-5 py-3 bg-white shadow-md border border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}


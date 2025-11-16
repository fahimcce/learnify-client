"use client";

import { Conversation, ActiveUser } from "@/redux/features/chat/chat.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type ViewMode = "conversations" | "active-users";

// Tailwind gradient classes - extracted to avoid linter false positives
const GRADIENT_HEADER = "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600";
const GRADIENT_ICON_BG = "bg-gradient-to-br from-indigo-100 to-purple-100";
const GRADIENT_AVATAR_INDIGO = "bg-gradient-to-br from-indigo-500 to-purple-600";
const GRADIENT_AVATAR_GREEN = "bg-gradient-to-br from-green-500 to-emerald-600";
const GRADIENT_HOVER = "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50";
const GRADIENT_SELECTED = "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50";

interface ConversationsListProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  conversations: Conversation[];
  activeUsers: ActiveUser[];
  selectedConversation: Conversation | null;
  currentUserId: string | undefined;
  onSelectConversation: (conversation: Conversation) => void;
  onStartChatWithUser: (user: ActiveUser) => void;
  getUserConversation: (userId: string) => Conversation | undefined;
}

export default function ConversationsList({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  conversations,
  activeUsers,
  selectedConversation,
  currentUserId,
  onSelectConversation,
  onStartChatWithUser,
  getUserConversation,
}: ConversationsListProps) {
  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    // Find the other participant using proper ID comparison
    const otherUser = conv.participants.find((p) => {
      const participantId = p._id || "";
      const currentId = currentUserId || "";
      return (
        participantId.toString() !== currentId.toString() &&
        participantId !== "" &&
        participantId !== "current-user"
      );
    });
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser?.name.toLowerCase().includes(searchLower) ||
      otherUser?.email.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  // Filter active users by search query
  const filteredActiveUsersList = activeUsers.filter((user) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header with gradient */}
      <div className={`${GRADIENT_HEADER} p-6 text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-4">
          {viewMode === "conversations" ? (
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <MessageSquare className="h-6 w-6" />
            </div>
          ) : (
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6" />
            </div>
          )}
          <h2 className="text-xl font-bold">
            {viewMode === "conversations" ? "Conversations" : "Active Users"}
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setViewMode("conversations")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              viewMode === "conversations"
                ? "bg-white text-indigo-600 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chats</span>
          </button>
          <button
            onClick={() => setViewMode("active-users")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              viewMode === "active-users"
                ? "bg-white text-indigo-600 shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={
              viewMode === "conversations"
                ? "Search conversations..."
                : "Search students..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {viewMode === "conversations" ? (
          filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${GRADIENT_ICON_BG} mb-4`}>
                <MessageSquare className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-slate-600 font-medium">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Start a new conversation"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              // Find the other participant (not the current user)
              const otherUser = conversation.participants.find((p) => {
                const participantId = p._id || "";
                const currentId = currentUserId || "";
                return (
                  participantId.toString() !== currentId.toString() &&
                  participantId !== "" &&
                  participantId !== "current-user"
                );
              });

              if (!otherUser) {
                console.warn("No other user found in conversation:", {
                  conversationId: conversation._id,
                  participants: conversation.participants,
                  currentUserId,
                });
                return null;
              }

              const isSelected =
                selectedConversation?._id === conversation._id;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    `w-full p-4 border-b border-slate-100 transition-all duration-200 text-left ${GRADIENT_HOVER}`,
                    isSelected &&
                      `${GRADIENT_SELECTED} border-l-4 border-l-indigo-600 shadow-sm`
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="ring-2 ring-offset-2 ring-indigo-200">
                      <AvatarImage src="" />
                      <AvatarFallback className={`${GRADIENT_AVATAR_INDIGO} text-white font-semibold`}>
                        {otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-slate-800 truncate">
                          {otherUser.name}
                        </div>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">
                            {format(
                              new Date(conversation.lastMessageAt),
                              "HH:mm"
                            )}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <div className="text-sm text-slate-600 truncate">
                          {conversation.lastMessage.content ||
                            (conversation.lastMessage.messageType === "image"
                              ? "📷 Image"
                              : "📄 File")}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )
        ) : filteredActiveUsersList.length === 0 ? (
          <div className="p-8 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${GRADIENT_ICON_BG} mb-4`}>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-slate-600 font-medium">
              {searchQuery ? "No students found" : "No active students available"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery ? "Try a different search term" : "Check back later"}
            </p>
          </div>
        ) : (
          filteredActiveUsersList.map((user) => {
            const existingConversation = getUserConversation(user._id);
            const hasConversation = !!existingConversation;

            return (
              <button
                key={user._id}
                onClick={() => {
                  if (hasConversation && existingConversation) {
                    onSelectConversation(existingConversation);
                    setViewMode("conversations");
                  } else {
                    onStartChatWithUser(user);
                  }
                }}
                className={`w-full p-4 border-b border-slate-100 transition-all duration-200 text-left ${GRADIENT_HOVER}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-offset-2 ring-green-200">
                    <AvatarImage src="" />
                    <AvatarFallback className={`${GRADIENT_AVATAR_GREEN} text-white font-semibold`}>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-slate-800 truncate">
                        {user.name}
                      </div>
                      {hasConversation && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                          Chat
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {user.phone}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}


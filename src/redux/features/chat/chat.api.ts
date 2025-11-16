import { api } from "@/redux/api/api";

export interface ChatMessage {
  _id: string;
  conversationId: {
    _id: string;
  };
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  receiverId: {
    _id: string;
    name: string;
    email: string;
  };
  messageType: "text" | "image" | "pdf";
  content?: string;
  fileUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: "sent" | "delivered" | "read";
  isDeleted: boolean;
  deletedBy?: string;
  isBlocked?: boolean;
  blockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  }[];
  lastMessage?: ChatMessage;
  lastMessageAt?: string;
  isDeleted: boolean;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number; // Client-side computed field
  otherParticipant?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  }; // Client-side computed field
}

export interface ActiveUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface SendTextMessagePayload {
  receiverId: string;
  content: string;
}

export interface SendFileMessagePayload {
  file: File;
  receiverId: string;
}

export interface UpdateMessageStatusPayload {
  status: "sent" | "delivered" | "read";
}

export interface GetConversationMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

export interface ConversationMessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChatStatistics {
  totalConversations: number;
  totalMessages: number;
  blockedMessages: number;
  unreadMessages: number;
  messagesByType: {
    _id: string;
    count: number;
  }[];
}

const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // User: Get active users
    getActiveUsers: builder.query<ActiveUser[], void>({
      query: () => ({
        url: "/chat/active-users",
        method: "GET",
      }),
      transformResponse: (response: { data: ActiveUser[] }) => response.data,
      providesTags: ["chat"],
    }),

    // User: Get my conversations
    getMyConversations: builder.query<Conversation[], void>({
      query: () => ({
        url: "/chat/my-conversations",
        method: "GET",
      }),
      transformResponse: (response: { data: Conversation[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              { type: "chat" as const, id: "LIST" },
              ...result.map((conv) => ({
                type: "chat" as const,
                id: conv._id,
              })),
            ]
          : [{ type: "chat" as const, id: "LIST" }],
    }),

    // User: Get conversation messages
    getConversationMessages: builder.query<
      ConversationMessagesResponse,
      GetConversationMessagesParams
    >({
      query: ({ conversationId, page = 1, limit = 50 }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (response: { data: ConversationMessagesResponse }) =>
        response.data,
      // Provide specific tags per conversation to avoid invalidating all messages
      providesTags: (result, error, arg) => [
        { type: "chat" as const, id: "MESSAGES" },
        { type: "chat" as const, id: `MESSAGES-${arg.conversationId}` },
      ],
    }),

    // User: Get message by ID
    getMessageById: builder.query<ChatMessage, string>({
      query: (id) => ({
        url: `/chat/messages/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: ChatMessage }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "chat", id }],
    }),

    // User: Send text message
    sendTextMessage: builder.mutation<ChatMessage, SendTextMessagePayload>({
      query: (data) => ({
        url: "/chat/send-text",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: ChatMessage }) => response.data,
      // Invalidate messages to show immediately, but socket handler will prevent duplicates
      invalidatesTags: (result, error, arg) => {
        if (result) {
          const conversationId =
            result.conversationId?._id ||
            (typeof result.conversationId === "string"
              ? result.conversationId
              : null);
          return [
            { type: "chat" as const, id: "LIST" }, // Conversations list
            { type: "chat" as const, id: "MESSAGES" }, // All messages
            ...(conversationId
              ? [
                  { type: "chat" as const, id: conversationId },
                  { type: "chat" as const, id: `MESSAGES-${conversationId}` },
                ]
              : []),
          ];
        }
        return [];
      },
    }),

    // User: Send file message
    sendFileMessage: builder.mutation<ChatMessage, SendFileMessagePayload>({
      query: ({ file, receiverId }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("receiverId", receiverId);

        return {
          url: "/chat/send-file",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: { data: ChatMessage }) => response.data,
      // Invalidate messages to show immediately, but socket handler will prevent duplicates
      invalidatesTags: (result, error, arg) => {
        if (result) {
          const conversationId =
            result.conversationId?._id ||
            (typeof result.conversationId === "string"
              ? result.conversationId
              : null);
          return [
            { type: "chat" as const, id: "LIST" }, // Conversations list
            { type: "chat" as const, id: "MESSAGES" }, // All messages
            ...(conversationId
              ? [
                  { type: "chat" as const, id: conversationId },
                  { type: "chat" as const, id: `MESSAGES-${conversationId}` },
                ]
              : []),
          ];
        }
        return [];
      },
    }),

    // User: Update message status
    updateMessageStatus: builder.mutation<
      ChatMessage,
      { id: string; data: UpdateMessageStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/chat/messages/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: ChatMessage }) => response.data,
      invalidatesTags: ["chat"],
    }),

    // User: Mark conversation as read
    markConversationAsRead: builder.mutation<{ updatedCount: number }, string>({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: { updatedCount: number } }) =>
        response.data,
      invalidatesTags: ["chat"],
    }),

    // User: Delete message
    deleteMessage: builder.mutation<ChatMessage, string>({
      query: (id) => ({
        url: `/chat/messages/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: ChatMessage }) => response.data,
      invalidatesTags: ["chat"],
    }),

    // User: Delete conversation
    deleteConversation: builder.mutation<Conversation, string>({
      query: (id) => ({
        url: `/chat/conversations/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: Conversation }) => response.data,
      invalidatesTags: ["chat"],
    }),

    // Admin: Get all conversations
    getAllConversations: builder.query<
      Conversation[],
      { userId?: string } | void
    >({
      query: (params) => ({
        url: "/chat/conversations",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: { data: Conversation[] }) => response.data,
      providesTags: ["chat"],
    }),

    // Admin: Get all messages
    getAllMessages: builder.query<
      ChatMessage[],
      {
        conversationId?: string;
        senderId?: string;
        receiverId?: string;
        messageType?: "text" | "image" | "pdf";
        isBlocked?: boolean;
      } | void
    >({
      query: (params) => ({
        url: "/chat/messages",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: { data: ChatMessage[] }) => response.data,
      providesTags: ["chat"],
    }),

    // Admin: Get message by ID
    getAdminMessageById: builder.query<ChatMessage, string>({
      query: (id) => ({
        url: `/chat/messages/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: ChatMessage }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "chat", id }],
    }),

    // Admin: Block or unblock message
    blockOrUnblockMessage: builder.mutation<
      ChatMessage,
      { id: string; isBlocked: boolean }
    >({
      query: ({ id, isBlocked }) => ({
        url: `/chat/messages/${id}/block-status`,
        method: "PATCH",
        body: { isBlocked },
      }),
      transformResponse: (response: { data: ChatMessage }) => response.data,
      invalidatesTags: ["chat"],
    }),

    // Admin: Hard delete message
    hardDeleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/chat/messages/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["chat"],
    }),

    // Admin: Hard delete conversation
    hardDeleteConversation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/chat/conversations/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["chat"],
    }),

    // Admin: Get chat statistics
    getChatStatistics: builder.query<ChatStatistics, void>({
      query: () => ({
        url: "/chat/statistics",
        method: "GET",
      }),
      transformResponse: (response: { data: ChatStatistics }) => response.data,
      providesTags: ["chat"],
    }),
  }),
});

export const {
  useGetActiveUsersQuery,
  useGetMyConversationsQuery,
  useGetConversationMessagesQuery,
  useGetMessageByIdQuery,
  useSendTextMessageMutation,
  useSendFileMessageMutation,
  useUpdateMessageStatusMutation,
  useMarkConversationAsReadMutation,
  useDeleteMessageMutation,
  useDeleteConversationMutation,
  useGetAllConversationsQuery,
  useGetAllMessagesQuery,
  useGetAdminMessageByIdQuery,
  useBlockOrUnblockMessageMutation,
  useHardDeleteMessageMutation,
  useHardDeleteConversationMutation,
  useGetChatStatisticsQuery,
} = chatApi;

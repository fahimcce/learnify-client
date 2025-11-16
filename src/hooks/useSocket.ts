"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export interface SocketMessage {
  _id: string;
  conversationId: string | { _id: string };
  senderId: string | { _id: string; name: string; email: string };
  receiverId: string | { _id: string; name: string; email: string };
  messageType: "text" | "image" | "pdf";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: "sent" | "delivered" | "read";
  isDeleted?: boolean;
  updatedAt?: string;
  createdAt: string;
}

export interface TypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (receiverId: string, content: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string, receiverId: string) => void;
  stopTyping: (conversationId: string, receiverId: string) => void;
  markMessageRead: (messageId: string) => void;
  markConversationRead: (conversationId: string) => void;
  onMessage: (callback: (message: SocketMessage) => void) => void;
  offMessage: (callback: (message: SocketMessage) => void) => void;
  onTyping: (callback: (data: TypingData) => void) => void;
  offTyping: (callback: (data: TypingData) => void) => void;
  onMessageRead: (
    callback: (data: { messageId: string; readBy: string }) => void
  ) => void;
  offMessageRead: (
    callback: (data: { messageId: string; readBy: string }) => void
  ) => void;
  onUserOnline: (callback: (data: { userId: string }) => void) => void;
  offUserOnline: (callback: (data: { userId: string }) => void) => void;
  onUserOffline: (callback: (data: { userId: string }) => void) => void;
  offUserOffline: (callback: (data: { userId: string }) => void) => void;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      // Only log in development and suppress repeated connection errors
      if (process.env.NODE_ENV === "development") {
        // Suppress the error if it's a connection refused (backend not running)
        if (
          error.message?.includes("websocket error") ||
          error.message?.includes("xhr poll error")
        ) {
          // Silently handle - backend is likely not running
          return;
        }
        console.warn("Socket connection error:", error.message || error);
      }
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  const sendMessage = (receiverId: string, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("send-message", {
        receiverId,
        content,
      });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("join-conversation", { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("leave-conversation", { conversationId });
    }
  };

  const startTyping = (conversationId: string, receiverId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing", {
        conversationId,
        receiverId,
      });
    }
  };

  const stopTyping = (conversationId: string, receiverId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("stop-typing", {
        conversationId,
        receiverId,
      });
    }
  };

  const markMessageRead = (messageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("mark-message-read", { messageId });
    }
  };

  const markConversationRead = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("mark-conversation-read", { conversationId });
    }
  };

  const onMessage = (callback: (message: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on("new-message", callback);
    }
  };

  const offMessage = (callback: (message: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.off("new-message", callback);
    }
  };

  const onTyping = (callback: (data: TypingData) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user-typing", callback);
    }
  };

  const offTyping = (callback: (data: TypingData) => void) => {
    if (socketRef.current) {
      socketRef.current.off("user-typing", callback);
    }
  };

  const onMessageRead = (
    callback: (data: { messageId: string; readBy: string }) => void
  ) => {
    if (socketRef.current) {
      socketRef.current.on("message-read", callback);
    }
  };

  const offMessageRead = (
    callback: (data: { messageId: string; readBy: string }) => void
  ) => {
    if (socketRef.current) {
      socketRef.current.off("message-read", callback);
    }
  };

  const onUserOnline = (callback: (data: { userId: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user-online", callback);
    }
  };

  const offUserOnline = (callback: (data: { userId: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.off("user-online", callback);
    }
  };

  const onUserOffline = (callback: (data: { userId: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user-offline", callback);
    }
  };

  const offUserOffline = (callback: (data: { userId: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.off("user-offline", callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessageRead,
    markConversationRead,
    onMessage,
    offMessage,
    onTyping,
    offTyping,
    onMessageRead,
    offMessageRead,
    onUserOnline,
    offUserOnline,
    onUserOffline,
    offUserOffline,
  };
}

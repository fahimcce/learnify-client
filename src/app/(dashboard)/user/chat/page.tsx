// "use client";

// import { useState, useEffect, useRef, useMemo } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
// import {
//   useGetMyConversationsQuery,
//   useGetConversationMessagesQuery,
//   useGetActiveUsersQuery,
//   useSendTextMessageMutation,
//   useSendFileMessageMutation,
//   useMarkConversationAsReadMutation,
//   Conversation,
//   ChatMessage,
//   ActiveUser,
// } from "@/redux/features/chat/chat.api";
// import { useSocket } from "@/hooks/useSocket";
// import { Loader2, MessageSquare, X } from "lucide-react";
// import { toast } from "sonner";
// import ConversationsList from "./_components/ConversationsList";
// import ChatHeader from "./_components/ChatHeader";
// import MessagesArea from "./_components/MessagesArea";
// import FilePreview from "./_components/FilePreview";
// import MessageInput from "./_components/MessageInput";
// import EmptyState from "./_components/EmptyState";
// import BackendUnavailable from "./_components/BackendUnavailable";

// type ViewMode = "conversations" | "active-users";

// // Tailwind gradient classes - extracted to avoid linter false positives
// const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50";
// const GRADIENT_HEADER = "bg-gradient-to-r from-indigo-600 to-purple-600";

// export default function ChatPage() {
//   const [selectedConversation, setSelectedConversation] =
//     useState<Conversation | null>(null);
//   const [message, setMessage] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [fileToSend, setFileToSend] = useState<File | null>(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
//     null
//   );
//   const [viewMode, setViewMode] = useState<ViewMode>("conversations");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Get current user ID - try multiple sources
//   const authUser = useSelector((state: RootState) => state.auth.user);
//   const currentUserIdFromAuth = authUser?._id;

//   const {
//     data: conversations,
//     isLoading: isLoadingConversations,
//     refetch: refetchConversations,
//     error: conversationsError,
//   } = useGetMyConversationsQuery();

//   const conversationsArray = Array.isArray(conversations) ? conversations : [];

//   // Try to extract current user ID from conversations if not in auth
//   // This is a fallback when the user object doesn't have _id
//   const currentUserId = useMemo(() => {
//     // First try to get from auth
//     if (currentUserIdFromAuth) {
//       return currentUserIdFromAuth.toString();
//     }

//     // If not in auth, try to find it from conversations by matching email
//     if (conversationsArray.length > 0 && authUser?.email) {
//       for (const conv of conversationsArray) {
//         const currentUserParticipant = conv.participants.find(
//           (p) => p.email === authUser.email
//         );
//         if (currentUserParticipant?._id) {
//           const foundId = currentUserParticipant._id.toString();
//           console.log("Found currentUserId from conversations:", {
//             foundId,
//             email: authUser.email,
//             conversationId: conv._id,
//           });
//           return foundId;
//         }
//       }
//     }

//     console.warn("Could not find currentUserId:", {
//       authUser,
//       hasConversations: conversationsArray.length > 0,
//       conversationsCount: conversationsArray.length,
//     });

//     return undefined;
//   }, [currentUserIdFromAuth, conversationsArray, authUser?.email]);

//   const {
//     data: activeUsers,
//     isLoading: isLoadingActiveUsers,
//     error: activeUsersError,
//   } = useGetActiveUsersQuery();

//   const {
//     data: messagesData,
//     isLoading: isLoadingMessages,
//     refetch: refetchMessages,
//   } = useGetConversationMessagesQuery(
//     {
//       conversationId: selectedConversation?._id || "",
//       limit: 100,
//       page: 1,
//     },
//     {
//       skip:
//         !selectedConversation || selectedConversation._id.startsWith("temp-"),
//     }
//   );

//   const [sendTextMessage, { isLoading: isSendingText }] =
//     useSendTextMessageMutation();
//   const [sendFileMessage, { isLoading: isSendingFile }] =
//     useSendFileMessageMutation();
//   const [markConversationAsRead] = useMarkConversationAsReadMutation();

//   const socket = useSocket();
//   const activeUsersArray = Array.isArray(activeUsers) ? activeUsers : [];
//   const messages = messagesData?.messages || [];

//   // Track message IDs to prevent duplicates
//   const currentMessageIdsRef = useRef<Set<string>>(new Set());
//   // Track recently sent message IDs to skip socket events for our own messages
//   const recentlySentMessageIdsRef = useRef<Set<string>>(new Set());

//   useEffect(() => {
//     if (messages && messages.length > 0) {
//       currentMessageIdsRef.current = new Set(
//         messages.map((msg: ChatMessage) => msg._id)
//       );
//       // Also update the lastFetchedMessageIds to include current messages
//       messages.forEach((msg: ChatMessage) => {
//         lastFetchedMessageIdsRef.current.add(msg._id);
//       });
//     }
//   }, [messages]);

//   const isLoading = isLoadingMessages || isSendingText || isSendingFile;

//   // Filter out current user from active users
//   const filteredActiveUsers = activeUsersArray.filter(
//     (user) => user._id !== currentUserId
//   );

//   // Check if user already has a conversation with an active user
//   const getUserConversation = (userId: string) => {
//     return conversationsArray.find((conv) =>
//       conv.participants.some((p) => p._id === userId)
//     );
//   };

//   // Handle starting a chat with an active user
//   const handleStartChatWithUser = (user: ActiveUser) => {
//     // Validate user ID
//     if (!user._id || user._id.trim() === "") {
//       toast.error("Invalid user selected. Please try again.");
//       return;
//     }

//     // Check if conversation already exists
//     const existingConversation = getUserConversation(user._id);
//     if (existingConversation) {
//       setSelectedConversation(existingConversation);
//       setViewMode("conversations");
//       setIsMobileMenuOpen(false);
//       return;
//     }

//     // Create a temporary conversation object for users without existing conversations
//     // This allows the chat window to open and the user can send the first message
//     // Put the receiver (other user) first, then current user, to ensure we can find it easily
//     const tempConversation: Conversation = {
//       _id: `temp-${user._id}`,
//       participants: [
//         {
//           _id: user._id, // Receiver - the user we want to chat with
//           name: user.name,
//           email: user.email,
//           phone: user.phone,
//         },
//         {
//           _id: currentUserId || "current-user",
//           name: "",
//           email: "",
//         },
//       ],
//       isDeleted: false,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     setSelectedConversation(tempConversation);
//     setViewMode("conversations");
//     setIsMobileMenuOpen(false);
//   };

//   // Get other participant for selected conversation
//   // This should always be the participant who is NOT the current user
//   const otherParticipant = selectedConversation
//     ? (() => {
//         const currentId = currentUserId || "";
//         // Find the participant that is NOT the current user
//         // Use string comparison to handle ObjectId vs string mismatches
//         const other = selectedConversation.participants.find((p) => {
//           const participantId = (p._id || "").toString();
//           const currentIdStr = currentId.toString();
//           return (
//             participantId !== currentIdStr &&
//             participantId !== "" &&
//             participantId !== "current-user"
//           );
//         });

//         // Debug log if we can't find the other participant
//         if (!other && selectedConversation.participants.length > 0) {
//           console.warn("Could not find other participant:", {
//             conversationId: selectedConversation._id,
//             participants: selectedConversation.participants.map((p) => ({
//               id: p._id,
//               name: p.name,
//               email: p.email,
//             })),
//             currentUserId: currentId,
//           });
//         }

//         return other || null;
//       })()
//     : null;

//   // Debug: Log otherParticipant when it changes (only log conversation ID to avoid infinite loops)
//   useEffect(() => {
//     if (selectedConversation && otherParticipant) {
//       console.log("Chat Header - Other Participant:", {
//         conversationId: selectedConversation._id,
//         otherParticipantName: otherParticipant.name,
//         otherParticipantId: otherParticipant._id,
//         currentUserId,
//         participants: selectedConversation.participants.map((p) => ({
//           id: p._id,
//           idType: typeof p._id,
//           name: p.name,
//           isCurrentUser:
//             (p._id || "").toString() === (currentUserId || "").toString(),
//         })),
//       });
//     }
//   }, [selectedConversation?._id, otherParticipant?._id, currentUserId]); // Only depend on IDs to avoid infinite loops

//   // Store markConversationAsRead in a ref to avoid dependency issues
//   const markConversationAsReadRef = useRef(markConversationAsRead);
//   const lastMarkedConversationRef = useRef<string | null>(null);
//   const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     markConversationAsReadRef.current = markConversationAsRead;
//   }, [markConversationAsRead]);

//   // Join conversation room when selected
//   useEffect(() => {
//     const conversationId = selectedConversation?._id;
//     if (conversationId && !conversationId.startsWith("temp-")) {
//       socket.joinConversation(conversationId);

//       // Only mark as read if this is a different conversation
//       if (lastMarkedConversationRef.current !== conversationId) {
//         lastMarkedConversationRef.current = conversationId;
//         // Clear any pending timeout
//         if (markReadTimeoutRef.current) {
//           clearTimeout(markReadTimeoutRef.current);
//           markReadTimeoutRef.current = null;
//         }
//         // Mark as read immediately for new conversation
//         markConversationAsReadRef.current(conversationId);
//       }
//     }
//     return () => {
//       if (conversationId && !conversationId.startsWith("temp-")) {
//         socket.leaveConversation(conversationId);
//       }
//       // Clear timeout on unmount
//       if (markReadTimeoutRef.current) {
//         clearTimeout(markReadTimeoutRef.current);
//         markReadTimeoutRef.current = null;
//       }
//     };
//   }, [selectedConversation?._id, socket]); // Removed markConversationAsRead from deps

//   // Use refs to store latest values to avoid dependency issues
//   const selectedConversationIdRef = useRef(selectedConversation?._id);
//   const currentUserIdRef = useRef(currentUserId);

//   useEffect(() => {
//     selectedConversationIdRef.current = selectedConversation?._id;
//     currentUserIdRef.current = currentUserId;
//   }, [selectedConversation?._id, currentUserId]);

//   // Store last message IDs to prevent duplicate refetches
//   const lastFetchedMessageIdsRef = useRef<Set<string>>(new Set());
//   const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const isRefetchingRef = useRef(false);

//   // Listen for new messages
//   useEffect(() => {
//     const handleNewMessage = (newMessage: any) => {
//       const conversationId =
//         typeof newMessage.conversationId === "string"
//           ? newMessage.conversationId
//           : newMessage.conversationId?._id;
//       const senderId =
//         typeof newMessage.senderId === "string"
//           ? newMessage.senderId
//           : newMessage.senderId?._id;
//       const receiverId =
//         typeof newMessage.receiverId === "string"
//           ? newMessage.receiverId
//           : newMessage.receiverId?._id;
//       const messageId = newMessage._id;

//       const currentConversationId = selectedConversationIdRef.current;
//       const currentUser = currentUserIdRef.current;

//       // Only process if it's for the current conversation or involves current user
//       if (
//         conversationId === currentConversationId ||
//         receiverId === currentUser ||
//         senderId === currentUser
//       ) {
//         // Skip if:
//         // 1. We already have this message ID in current messages
//         // 2. We recently sent this message (to prevent duplicate from RTK Query + socket)
//         // 3. We recently fetched this message
//         if (
//           messageId &&
//           (currentMessageIdsRef.current.has(messageId) ||
//             recentlySentMessageIdsRef.current.has(messageId) ||
//             lastFetchedMessageIdsRef.current.has(messageId))
//         ) {
//           return;
//         }

//         // Debounce refetch to prevent multiple rapid refetches
//         if (refetchTimeoutRef.current) {
//           clearTimeout(refetchTimeoutRef.current);
//         }

//         refetchTimeoutRef.current = setTimeout(() => {
//           // Skip if already refetching
//           if (isRefetchingRef.current) {
//             return;
//           }

//           isRefetchingRef.current = true;
//           refetchMessages()
//             .then(() => {
//               if (messageId) {
//                 lastFetchedMessageIdsRef.current.add(messageId);
//                 // Keep only last 100 message IDs to prevent memory leak
//                 if (lastFetchedMessageIdsRef.current.size > 100) {
//                   const idsArray = Array.from(lastFetchedMessageIdsRef.current);
//                   lastFetchedMessageIdsRef.current = new Set(
//                     idsArray.slice(-100)
//                   );
//                 }
//               }
//             })
//             .finally(() => {
//               isRefetchingRef.current = false;
//               refetchTimeoutRef.current = null;
//             });
//         }, 300); // Debounce by 300ms

//         // Only mark as read if it's the current conversation and not a temp one
//         // Debounce: only mark as read once per second for the same conversation
//         if (
//           conversationId === currentConversationId &&
//           currentConversationId &&
//           !currentConversationId.startsWith("temp-")
//         ) {
//           // Clear any pending timeout
//           if (markReadTimeoutRef.current) {
//             clearTimeout(markReadTimeoutRef.current);
//           }
//           // Debounce: wait 1 second before marking as read
//           markReadTimeoutRef.current = setTimeout(() => {
//             if (lastMarkedConversationRef.current === currentConversationId) {
//               markConversationAsReadRef.current(currentConversationId);
//             }
//             markReadTimeoutRef.current = null;
//           }, 1000);
//         }
//       }
//     };

//     socket.onMessage(handleNewMessage);
//     return () => {
//       socket.offMessage(handleNewMessage);
//       if (refetchTimeoutRef.current) {
//         clearTimeout(refetchTimeoutRef.current);
//         refetchTimeoutRef.current = null;
//       }
//       isRefetchingRef.current = false;
//     };
//   }, [socket, refetchMessages]); // Removed markConversationAsRead from deps, using ref instead

//   // Listen for typing indicators
//   useEffect(() => {
//     const currentConversationId = selectedConversation?._id;
//     if (!currentConversationId || currentConversationId.startsWith("temp-"))
//       return;

//     const handleTyping = (data: {
//       conversationId: string;
//       userId: string;
//       isTyping: boolean;
//     }) => {
//       if (
//         data.conversationId === currentConversationId &&
//         data.userId !== currentUserId
//       ) {
//         setIsTyping(data.isTyping);
//       }
//     };

//     socket.onTyping(handleTyping);
//     return () => {
//       socket.offTyping(handleTyping);
//     };
//   }, [selectedConversation?._id, currentUserId, socket]);

//   const handleSendMessage = async () => {
//     if (!selectedConversation || !otherParticipant) return;

//     if (!message.trim() && !fileToSend) return;

//     // Validate receiverId
//     if (!otherParticipant._id || otherParticipant._id.trim() === "") {
//       console.error("Invalid receiverId:", {
//         otherParticipant,
//         selectedConversation,
//         currentUserId,
//       });
//       toast.error("Invalid receiver. Please try again.");
//       return;
//     }

//     // Check if this is a temporary conversation (new chat)
//     const isTempConversation = selectedConversation._id.startsWith("temp-");

//     const receiverId = otherParticipant._id.trim();

//     // Final validation before sending
//     if (!receiverId || receiverId.length === 0) {
//       console.error("ReceiverId is empty after trim:", {
//         original: otherParticipant._id,
//         trimmed: receiverId,
//       });
//       toast.error("Invalid receiver ID. Please try again.");
//       return;
//     }

//     // Prevent sending message to yourself
//     if (receiverId === currentUserId) {
//       console.error("Cannot send message to yourself:", {
//         receiverId,
//         currentUserId,
//         otherParticipant,
//       });
//       toast.error("Cannot send message to yourself.");
//       return;
//     }

//     // Log the data being sent for debugging
//     console.log("Sending message with data:", {
//       receiverId,
//       receiverIdType: typeof receiverId,
//       receiverIdLength: receiverId?.length,
//       message: message.trim(),
//       isTempConversation,
//       otherParticipant,
//     });

//     try {
//       if (fileToSend) {
//         const sentFileMessage = await sendFileMessage({
//           file: fileToSend,
//           receiverId: receiverId,
//         }).unwrap();
//         // Track this message ID to skip socket event for it
//         if (sentFileMessage._id) {
//           recentlySentMessageIdsRef.current.add(sentFileMessage._id);
//           // Remove from tracking after 5 seconds
//           setTimeout(() => {
//             recentlySentMessageIdsRef.current.delete(sentFileMessage._id);
//           }, 5000);
//         }
//         setFileToSend(null);
//         if (fileInputRef.current) {
//           fileInputRef.current.value = "";
//         }
//       } else {
//         const payload = {
//           receiverId: receiverId,
//           content: message.trim(),
//         };
//         console.log("Sending text message payload:", payload);
//         const sentMessage = await sendTextMessage(payload).unwrap();
//         // Track this message ID to skip socket event for it
//         if (sentMessage._id) {
//           recentlySentMessageIdsRef.current.add(sentMessage._id);
//           // Remove from tracking after 5 seconds (socket event should have arrived by then)
//           setTimeout(() => {
//             recentlySentMessageIdsRef.current.delete(sentMessage._id);
//           }, 5000);
//         }
//         setMessage("");
//         if (typingTimeout) {
//           clearTimeout(typingTimeout);
//         }
//         if (!isTempConversation) {
//           socket.stopTyping(selectedConversation._id, receiverId);
//         }
//       }

//       if (!isTempConversation) {
//         socket.sendMessage(receiverId, message);
//       }

//       // If it was a temp conversation, refetch conversations to get the real one
//       if (isTempConversation) {
//         const { data: updatedConversations } = await refetchConversations();
//         // Find the newly created conversation
//         const updatedArray = Array.isArray(updatedConversations)
//           ? updatedConversations
//           : [];
//         const newConversation = updatedArray.find((conv) =>
//           conv.participants.some((p) => p._id === receiverId)
//         );
//         if (newConversation) {
//           setSelectedConversation(newConversation);
//           // Messages will be fetched automatically when selectedConversation changes
//         }
//       } else {
//         // Don't manually refetch after sending - let the socket event handle it
//         // This prevents duplicate messages from API response + socket event
//         // RTK Query will automatically update due to invalidatesTags: ["chat"]
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error?.data?.message ||
//         error?.message ||
//         "Failed to send message. Please try again.";
//       toast.error(errorMessage);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const isImage = file.type.startsWith("image/");
//       const isPDF = file.type === "application/pdf";

//       if (!isImage && !isPDF) {
//         toast.error("Please select an image or PDF file");
//         return;
//       }

//       if (file.size > 10 * 1024 * 1024) {
//         toast.error("File size must be less than 10MB");
//         return;
//       }

//       setFileToSend(file);
//     }
//   };

//   const handleTyping = () => {
//     if (
//       !selectedConversation ||
//       !otherParticipant ||
//       !message.trim() ||
//       selectedConversation._id.startsWith("temp-")
//     )
//       return;

//     if (typingTimeout) {
//       clearTimeout(typingTimeout);
//     }

//     socket.startTyping(selectedConversation._id, otherParticipant._id);

//     const timeout = setTimeout(() => {
//       socket.stopTyping(selectedConversation._id, otherParticipant._id);
//     }, 3000);

//     setTypingTimeout(timeout);
//   };

//   const handleRemoveFile = () => {
//     setFileToSend(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Check if backend is unavailable
//   const isBackendUnavailable =
//     (conversationsError as any)?.status === "FETCH_ERROR" ||
//     (activeUsersError as any)?.status === "FETCH_ERROR";

//   // Show backend unavailable message first if there's an error
//   if (isBackendUnavailable) {
//     return <BackendUnavailable />;
//   }

//   // Show loading only if we're actually loading and don't have data yet
//   if (
//     isLoadingConversations &&
//     viewMode === "conversations" &&
//     !conversations &&
//     !conversationsError
//   ) {
//     return (
//       <div className={`flex items-center justify-center min-h-[400px] ${GRADIENT_BG}`}>
//         <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   if (
//     isLoadingActiveUsers &&
//     viewMode === "active-users" &&
//     !activeUsers &&
//     !activeUsersError
//   ) {
//     return (
//       <div className={`flex items-center justify-center min-h-[400px] ${GRADIENT_BG}`}>
//         <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <div className={`relative h-[calc(100vh-200px)] ${GRADIENT_BG}`}>
//       <div className="flex h-full">
//         {/* Conversations/Active Users List - Desktop */}
//         <div
//           className={`hidden md:flex md:w-80 lg:w-96 flex-col bg-white/80 backdrop-blur-sm border-r border-slate-200/60 shadow-lg transition-all duration-300 ${
//             isMobileMenuOpen ? "flex" : ""
//           }`}
//         >
//           <ConversationsList
//             viewMode={viewMode}
//             setViewMode={setViewMode}
//             searchQuery={searchQuery}
//             setSearchQuery={setSearchQuery}
//             conversations={conversationsArray}
//             activeUsers={filteredActiveUsers}
//             selectedConversation={selectedConversation}
//             currentUserId={currentUserId}
//             onSelectConversation={(conv) => {
//               setSelectedConversation(conv);
//               setIsMobileMenuOpen(false);
//             }}
//             onStartChatWithUser={handleStartChatWithUser}
//             getUserConversation={getUserConversation}
//           />
//         </div>

//         {/* Mobile Menu Overlay */}
//         {isMobileMenuOpen && (
//           <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
//             <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl">
//               <div className="flex justify-end p-4">
//                 <button
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
//                 >
//                   <X className="h-5 w-5 text-slate-600" />
//                 </button>
//               </div>
//               <ConversationsList
//                 viewMode={viewMode}
//                 setViewMode={setViewMode}
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 conversations={conversationsArray}
//                 activeUsers={filteredActiveUsers}
//                 selectedConversation={selectedConversation}
//                 currentUserId={currentUserId}
//                 onSelectConversation={(conv) => {
//                   setSelectedConversation(conv);
//                   setIsMobileMenuOpen(false);
//                 }}
//                 onStartChatWithUser={handleStartChatWithUser}
//                 getUserConversation={getUserConversation}
//               />
//             </div>
//           </div>
//         )}

//         {/* Chat Window */}
//         <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm shadow-xl">
//           {selectedConversation && otherParticipant ? (
//             <>
//               {/* Mobile Header with Menu Button */}
//               <div className={`md:hidden flex items-center justify-between p-4 ${GRADIENT_HEADER} text-white shadow-lg`}>
//                 <button
//                   onClick={() => setIsMobileMenuOpen(true)}
//                   className="p-2 rounded-lg hover:bg-white/20 transition-colors"
//                 >
//                   <MessageSquare className="h-5 w-5" />
//                 </button>
//                 <div className="flex-1 text-center">
//                   <h2 className="font-semibold">{otherParticipant.name}</h2>
//                 </div>
//                 <div className="w-9" /> {/* Spacer */}
//               </div>

//               {/* Chat Header */}
//               <ChatHeader otherParticipant={otherParticipant} />

//               {/* Messages */}
//               <MessagesArea
//                 selectedConversation={selectedConversation}
//                 otherParticipant={otherParticipant}
//                 messages={messages}
//                 isLoadingMessages={isLoadingMessages}
//                 isTyping={isTyping}
//                 currentUserId={currentUserId}
//               />

//               {/* File Preview */}
//               {fileToSend && (
//                 <FilePreview file={fileToSend} onRemove={handleRemoveFile} />
//               )}

//               {/* Message Input */}
//               <MessageInput
//                 message={message}
//                 setMessage={setMessage}
//                 fileToSend={fileToSend}
//                 isLoading={isLoading}
//                 onSendMessage={handleSendMessage}
//                 onFileChange={handleFileChange}
//                 onRemoveFile={handleRemoveFile}
//                 onTyping={handleTyping}
//                 fileInputRef={fileInputRef}
//               />
//             </>
//           ) : (
//             <>
//               {/* Mobile Header when no conversation selected */}
//               <div className={`md:hidden flex items-center justify-between p-4 ${GRADIENT_HEADER} text-white shadow-lg`}>
//                 <button
//                   onClick={() => setIsMobileMenuOpen(true)}
//                   className="p-2 rounded-lg hover:bg-white/20 transition-colors"
//                 >
//                   <MessageSquare className="h-5 w-5" />
//                 </button>
//                 <div className="flex-1 text-center">
//                   <h2 className="font-semibold">Messages</h2>
//                 </div>
//                 <div className="w-9" /> {/* Spacer */}
//               </div>
//               <EmptyState
//                 title="Select a conversation"
//                 description="Choose a conversation from the list to start chatting"
//               />
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] text-2xl font-bold">
      ChatPage Coming Soon....
    </div>
  );
}

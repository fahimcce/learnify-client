"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { baseUrl } from "@/redux/api/api";
import { Loader2, MessageCircle, X, Sparkles, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ChatbotWidget = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the Learnify AI assistant. Ask me anything about your courses or quizzes.",
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const apiBase = useMemo(() => (baseUrl || "").replace(/\/$/, ""), [baseUrl]);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextMessages = [
      ...messages,
      { role: "user" as const, content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setIsTyping(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = token;
      }

      const res = await fetch(`${apiBase}/chatbot/chat`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();
      const reply =
        data?.data?.reply ||
        data?.message ||
        "Sorry, I could not process that right now.";

      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button - Bigger & Colorful */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
          
          {/* Button */}
          <Button
            className="relative h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 border-2 border-white/20"
            size="icon"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <X className="h-8 w-8 text-white" />
            ) : (
              <MessageCircle className="h-8 w-8 text-white" />
            )}
          </Button>
          
          {/* Notification Badge */}
          {!isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
            >
              <Sparkles className="h-3 w-3 text-white" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-6 z-50 w-80 sm:w-96"
          >
            <Card className="shadow-2xl border-2 border-purple-500/20 overflow-hidden">
              {/* Colorful Header */}
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black">Learnify AI</CardTitle>
                      <p className="text-xs text-white/80 font-medium">Powered by Google Gemini</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/20 text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="h-80 overflow-y-auto space-y-3 pr-2 bg-gradient-to-b from-background to-muted/20">
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      m.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                        m.role === "assistant"
                          ? "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-foreground border border-purple-200 dark:border-purple-800"
                          : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      }`}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-foreground flex items-center gap-2 border border-purple-200 dark:border-purple-800">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span>AI is thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={endRef} />
              </CardContent>

              {/* Input Footer */}
              <CardFooter className="pt-4 bg-muted/30">
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isSending}
                    className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isSending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;

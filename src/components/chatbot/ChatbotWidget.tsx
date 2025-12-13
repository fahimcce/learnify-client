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
import { Loader2, MessageCircle, X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

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
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="rounded-full shadow-lg animate-bounce"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96">
          <Card className="shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Learnify AI Chatbot</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="h-80 overflow-y-auto space-y-3 pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    m.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted text-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Assistant is typing...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex w-full gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isSending}
                />
                <Button onClick={sendMessage} disabled={isSending}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

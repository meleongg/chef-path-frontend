"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks";
import { api, ApiError } from "@/lib/api";
import { ChatMessage } from "@/types";
import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function FloatingChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPulse, setShowPulse] = useState(false);
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rateLimitTimeoutRef = useRef<number | null>(null);

  const isRateLimited = rateLimitUntil !== null && rateLimitUntil > Date.now();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (rateLimitTimeoutRef.current !== null) {
        window.clearTimeout(rateLimitTimeoutRef.current);
      }
    };
  }, []);

  const startRateLimitCooldown = (retryAfterSeconds: number) => {
    const cooldownMs = Math.max(retryAfterSeconds, 1) * 1000;
    const expiresAt = Date.now() + cooldownMs;

    setRateLimitUntil(expiresAt);
    setError("");

    if (rateLimitTimeoutRef.current !== null) {
      window.clearTimeout(rateLimitTimeoutRef.current);
    }

    rateLimitTimeoutRef.current = window.setTimeout(() => {
      setRateLimitUntil(null);
      rateLimitTimeoutRef.current = null;
    }, cooldownMs);
  };

  const getRetryAfterSeconds = (err: ApiError) => {
    const retryAfterHeader = err?.response?.headers?.get?.("Retry-After");
    if (!retryAfterHeader) return null;

    const parsedSeconds = Number(retryAfterHeader);
    if (Number.isFinite(parsedSeconds) && parsedSeconds > 0) {
      return parsedSeconds;
    }

    return null;
  };

  // Listen for first plan generation to show pulse animation
  useEffect(() => {
    const handleFirstPlan = () => {
      // Only pulse if the user isn't already looking at the plan
      if (pathname !== "/weekly-plan") {
        setShowPulse(true);
        // Auto-hide pulse after 10 seconds
        setTimeout(() => setShowPulse(false), 10000);
      }
    };

    window.addEventListener("firstPlanGenerated", handleFirstPlan);

    return () => {
      window.removeEventListener("firstPlanGenerated", handleFirstPlan);
    };
  }, [pathname]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || isRateLimited) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputMessage.trim(),
      timestamp: new Date(),
      type: "general", // Will be updated based on backend classification
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError("");

    try {
      // Call the adaptive chat endpoint (Phase 2: intent routing)
      const response = await api.adaptiveChat(user.id, {
        user_message: userMessage.text,
      });

      // Update user message type based on classified intent
      const updatedUserMessage: ChatMessage = {
        ...userMessage,
        type: response.intent === "analytics" ? "analytics" : "general",
      };

      // Update the user message with classified intent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? updatedUserMessage : msg
        )
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.response,
        timestamp: new Date(),
        type: response.intent === "analytics" ? "analytics" : "general",
      };

      // Add the message to chat
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      const error =
        err instanceof ApiError
          ? err
          : err instanceof Error
            ? err
            : new Error(String(err));
      const apiError = err instanceof ApiError ? (err as ApiError) : null;
      const status =
        apiError?.status ??
        (err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined);
      if (status === 429) {
        const retryAfterSeconds =
          error instanceof ApiError ? getRetryAfterSeconds(error) : null;
        startRateLimitCooldown(retryAfterSeconds ?? 10);

        const rateLimitMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          sender: "ai",
          text: "You're sending messages too quickly. Please wait and try again.",
          timestamp: new Date(),
          type: "general",
        };

        setMessages((prev: ChatMessage[]) => [...prev, rateLimitMessage]);
        return;
      }

      const errorMsg =
        (error instanceof Error ? error.message : String(error)) ||
        "Failed to get response. Please try again.";
      setError(errorMsg);

      // Better UX: Keep the user message and restore it to input so they can retry
      setInputMessage(userMessage.text);
      // Remove the user message from display
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Hide chat on onboarding page
  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => {
              setIsOpen(true);
              setShowPulse(false);
            }}
            className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white hover:scale-110 ${
              showPulse ? "animate-pulse" : ""
            }`}
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          {showPulse && (
            <div className="absolute -top-2 -right-2 flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-green-500 items-center justify-center text-white text-xs font-bold">
                !
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl border-2 border-[hsl(var(--paprika))]/60 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300 bg-white overflow-hidden">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>Mise</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 hover:bg-amber-100 text-gray-600 hover:text-gray-900"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Ask me anything about cooking, recipes, or your meal plan!
            </p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-[hsl(var(--paprika))]/30">
                    <p className="text-lg font-medium mb-2">
                      👋 I&apos;m Mise, your ChefPath mentor!
                    </p>
                    <p className="text-sm">
                      Ask me about recipes, cooking techniques, or your meal
                      plan.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Sender Label */}
                  <p className="text-xs font-medium text-muted-foreground mb-1 px-1">
                    {message.sender === "user" ? "You" : "Mise"}
                  </p>

                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-500 text-white shadow-md"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 text-foreground border-2 border-gray-200 shadow-sm"
                    }`}
                  >
                    {/* Formatted message text */}
                    <div
                      className={`text-sm ${
                        message.sender === "user"
                          ? "text-white"
                          : "text-foreground"
                      }`}
                    >
                      {message.text.split("\n").map((line, idx) => {
                        // Check if line is a numbered list item (e.g., "1. ", "2. ")
                        const numberedMatch = line.match(
                          /^(\d+)\.\s+\*\*(.*?)\*\*(.*)$/
                        );
                        if (numberedMatch) {
                          return (
                            <p key={idx} className="mb-2">
                              <span className="font-semibold">
                                {numberedMatch[1]}. {numberedMatch[2]}
                              </span>
                              {numberedMatch[3]}
                            </p>
                          );
                        }

                        // Check for bold text with **
                        const boldMatch = line.match(/\*\*(.*?)\*\*/g);
                        if (boldMatch) {
                          const parts = line.split(/(\*\*.*?\*\*)/);
                          return (
                            <p key={idx} className="mb-1">
                              {parts.map((part, partIdx) => {
                                if (
                                  part.startsWith("**") &&
                                  part.endsWith("**")
                                ) {
                                  return (
                                    <span
                                      key={partIdx}
                                      className="font-semibold"
                                    >
                                      {part.slice(2, -2)}
                                    </span>
                                  );
                                }
                                return <span key={partIdx}>{part}</span>;
                              })}
                            </p>
                          );
                        }

                        // Regular line
                        return line.trim() ? (
                          <p key={idx} className="mb-1">
                            {line}
                          </p>
                        ) : (
                          <br key={idx} />
                        );
                      })}
                    </div>

                    {/* Timestamp */}
                    <p
                      className={`text-xs mt-2 ${
                        message.sender === "user"
                          ? "text-white/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-sm text-muted-foreground">
                      Thinking
                      <span className="animate-pulse">...</span>
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 text-sm">
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 space-y-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="resize-none min-h-[80px]"
                disabled={isLoading || isRateLimited}
              />
              {isRateLimited && (
                <p className="text-xs text-muted-foreground">
                  Rate limited. Please try again shortly.
                </p>
              )}
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isRateLimited}
                className="w-full bg-gradient-to-r from-[hsl(var(--turmeric))] to-orange-500 hover:opacity-90 text-white font-semibold"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

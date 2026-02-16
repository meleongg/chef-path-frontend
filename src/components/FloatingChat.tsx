"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks";
import { api } from "@/lib/api";
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
  const [pendingModificationId, setPendingModificationId] = useState<
    string | null
  >(null);
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (!inputMessage.trim() || !user) return;

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
        type:
          response.intent === "plan_modification"
            ? "plan_modification"
            : "general",
      };

      // Update the user message with classified intent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? updatedUserMessage : msg,
        ),
      );

      // Check if plan modification requires confirmation
      // Backend returns boolean, not string
      const requiresConfirmation = response.requires_confirmation === true;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.response,
        timestamp: new Date(),
        type:
          response.intent === "plan_modification"
            ? "plan_modification"
            : "general",
        // Set these properties BEFORE adding to messages array
        requires_confirmation: requiresConfirmation,
        originalRequest: requiresConfirmation ? userMessage.text : undefined,
      };

      // Set pending modification ID if confirmation is required
      if (requiresConfirmation) {
        setPendingModificationId(aiMessage.id);
      }

      // Now add the message with all properties set
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMsg =
        err?.message || "Failed to get response. Please try again.";
      setError(errorMsg);

      // Better UX: Keep the user message and restore it to input so they can retry
      setInputMessage(userMessage.text);
      // Remove the user message from display
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmModification = async (
    messageId: string,
    originalRequest: string,
  ) => {
    if (!user) return;

    setIsLoading(true);
    setPendingModificationId(null);

    try {
      // Call the LangGraph endpoint to execute the plan modification
      const updatedPlan = await api.confirmPlanModification(
        user.id,
        originalRequest,
      );

      // Success message
      const confirmMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        sender: "ai",
        text: `✅ Plan modification complete! Your week ${updatedPlan.week_number} plan has been updated.\n\nClick the button below to refresh and see your changes.`,
        timestamp: new Date(),
        type: "plan_modification",
        showRefreshButton: true,
      };

      setMessages((prev) => [...prev, confirmMessage]);
    } catch (err: any) {
      setError(err?.message || "Failed to confirm modification.");

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "ai",
        text: `❌ Failed to modify plan: ${
          err?.message || "Unknown error"
        }. Please try again.`,
        timestamp: new Date(),
        type: "plan_modification",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelModification = () => {
    setPendingModificationId(null);

    const cancelMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      sender: "ai",
      text: "Modification cancelled. Your plan remains unchanged.",
      timestamp: new Date(),
      type: "general",
    };

    setMessages((prev) => [...prev, cancelMessage]);
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
                      👋 I'm Mise, your ChefPath mentor!
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
                          /^(\d+)\.\s+\*\*(.*?)\*\*(.*)$/,
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

                    {/* Confirmation Buttons for Plan Modifications */}
                    {message.sender === "ai" &&
                      message.id === pendingModificationId &&
                      message.originalRequest && (
                        <div className="mt-3 pt-3 border-t border-border flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelModification}
                            disabled={isLoading}
                            className="flex-1 border-2 bg-[hsl(var(--paprika))]/10 hover:bg-[hsl(var(--paprika))]/20 text-[hsl(var(--paprika))] border-[hsl(var(--paprika))]/40 hover:border-[hsl(var(--paprika))]"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleConfirmModification(
                                message.id,
                                message.originalRequest!,
                              )
                            }
                            disabled={isLoading}
                            className="flex-1 bg-[hsl(var(--sage))] hover:bg-[hsl(var(--sage))]/90 text-white font-semibold border-2 border-[hsl(var(--sage))]/60"
                          >
                            {isLoading ? "Processing..." : "Confirm Changes"}
                          </Button>
                        </div>
                      )}

                    {/* Refresh Button for Successful Plan Modifications */}
                    {message.sender === "ai" && message.showRefreshButton && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (pathname === "/weekly-plan") {
                              window.location.reload();
                            } else {
                              window.location.href = "/weekly-plan";
                            }
                          }}
                          className="w-full bg-[hsl(var(--sage))] hover:bg-[hsl(var(--sage))]/90 text-white font-semibold border-2 border-[hsl(var(--sage))]/60"
                        >
                          🔄 Refresh Plan Page
                        </Button>
                      </div>
                    )}
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
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
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

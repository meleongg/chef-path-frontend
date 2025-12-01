"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks";
import { api } from "@/lib/api";
import { ChatMessage } from "@/types";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
          msg.id === userMessage.id ? updatedUserMessage : msg
        )
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.response,
        timestamp: new Date(),
        type:
          response.intent === "plan_modification"
            ? "plan_modification"
            : "general",
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Check if plan modification requires confirmation
      if (response.requires_confirmation === "true") {
        // Store the message ID and original request for confirmation buttons
        setPendingModificationId(aiMessage.id);
        // Store original request in the message for later use
        (aiMessage as any).originalRequest = userMessage.text;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to get response. Please try again.");
      // Remove the user message if the API call failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmModification = async (
    messageId: string,
    originalRequest: string
  ) => {
    if (!user) return;

    setIsLoading(true);
    setPendingModificationId(null);

    try {
      // Call the LangGraph endpoint to execute the plan modification
      const updatedPlan = await api.confirmPlanModification(
        user.id,
        originalRequest
      );

      // Success message with updated plan info
      const confirmMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        sender: "ai",
        text: `✅ Plan modification complete! Your week ${updatedPlan.week_number} plan has been updated with ${updatedPlan.recipes.length} recipes. Refresh the Weekly Plan page to see the changes.`,
        timestamp: new Date(),
        type: "plan_modification",
      };

      setMessages((prev) => [...prev, confirmMessage]);

      // Optional: Trigger a plan refresh if needed
      // You could dispatch an event or call a refresh function here
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

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-[hsl(var(--sage))] to-[hsl(var(--turmeric))] hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl border-2 border-[hsl(var(--paprika))]/30 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300 bg-white">
          <CardHeader className="border-b bg-gradient-to-r from-[hsl(var(--sage))]/10 to-[hsl(var(--turmeric))]/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>🤖</span>
                <span>ChefPath Assistant</span>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Ask me anything about cooking, recipes, or your meal plan!
            </p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <div>
                    <p className="text-lg font-medium mb-2">
                      👋 Welcome to ChefPath!
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
                    {message.sender === "user" ? "You" : "ChefPath"}
                  </p>

                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-foreground border border-border"
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

                    {/* Confirmation Buttons for Plan Modifications */}
                    {message.sender === "ai" &&
                      message.id === pendingModificationId &&
                      (message as any).originalRequest && (
                        <div className="mt-3 pt-3 border-t border-border flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelModification}
                            disabled={isLoading}
                            className="flex-1 border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleConfirmModification(
                                message.id,
                                (message as any).originalRequest
                              )
                            }
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          >
                            {isLoading ? "Processing..." : "Confirm Changes"}
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
                className="w-full bg-gradient-to-r from-[hsl(var(--sage))] to-[hsl(var(--turmeric))] hover:opacity-90"
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { waitingMessageService } from "@/services";
import { WaitingMessage } from "@/types/waitingMessage";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";

export function useWaitingMessages() {
  const [messages, setMessages] = useState<WaitingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const fetchUserMessages = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userMessages = await waitingMessageService.getUserMessages();
      setMessages(userMessages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load notifications";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await waitingMessageService.updateStatus(messageId, { status: "sent" });
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, status: "sent" } : msg
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update message status";
      toast({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    }
  }, [toast]);

  const refreshMessages = useCallback(() => {
    fetchUserMessages();
  }, [fetchUserMessages]);

  // Initial fetch
  useEffect(() => {
    fetchUserMessages();
  }, [fetchUserMessages]);

  // Get pending messages count
  const pendingCount = messages.filter(msg => msg.status === "pending").length;

  // Get recent messages (last 10, sorted by creation date)
  const recentMessages = messages
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return {
    messages: recentMessages,
    allMessages: messages,
    loading,
    error,
    pendingCount,
    markAsRead,
    refreshMessages,
    fetchUserMessages
  };
}
import { useEffect, useState, useCallback } from 'react';
import { useChatStore } from '@/stores/chat';
import { UseChatReturn } from '@/types/chat';

/**
 * A safe wrapper around useChatStore that prevents hydration mismatches
 * by ensuring data is only available after client-side hydration is complete
 */
export function useChat(): UseChatReturn {
  const [isClient, setIsClient] = useState(false);
  const chatStore = useChatStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe getters that return default values during SSR
  const currentConversation = isClient ? chatStore.currentConversation : null;
  const messages = isClient ? (chatStore.currentConversation?.messages || []) : [];
  const isOpen = isClient ? chatStore.ui.isOpen : false;
  const isTyping = isClient ? chatStore.ui.isTyping : false;
  const isLoading = isClient ? chatStore.ui.isLoading : false;
  const hasUnreadMessages = isClient ? chatStore.ui.hasUnreadMessages : false;
  const unreadCount = isClient ? chatStore.ui.unreadCount : 0;

  // Derived state
  const canSendMessage = isClient && !isLoading && !isTyping;
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Safe action wrappers that only work after hydration
  const sendMessage = useCallback(async (message: string, imageFile?: File | null) => {
    if (!isClient) return;
    return chatStore.sendMessage(message, imageFile);
  }, [chatStore, isClient]);

  const toggleChat = useCallback(() => {
    if (!isClient) return;
    chatStore.toggleChat();
  }, [chatStore, isClient]);

  const openChat = useCallback(() => {
    if (!isClient) return;
    chatStore.openChat();
  }, [chatStore, isClient]);

  const closeChat = useCallback(() => {
    if (!isClient) return;
    chatStore.closeChat();
  }, [chatStore, isClient]);

  const clearConversation = useCallback(() => {
    if (!isClient) return;
    chatStore.clearConversation();
  }, [chatStore, isClient]);

  const markAsRead = useCallback(() => {
    if (!isClient) return;
    chatStore.markAsRead();
  }, [chatStore, isClient]);

  return {
    // State
    currentConversation,
    messages,
    isOpen,
    isTyping,
    isLoading,
    hasUnreadMessages,
    unreadCount,
    isClient,
    
    // Actions
    sendMessage,
    toggleChat,
    openChat,
    closeChat,
    clearConversation,
    markAsRead,
    
    // Utility
    canSendMessage,
    lastMessage,
  };
}

"use client";

import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function FloatingChatButton() {
  const { t } = useTranslation();
  const { 
    toggleChat, 
    isOpen, 
    hasUnreadMessages, 
    unreadCount, 
    isClient 
  } = useChat();

  // Don't render anything during SSR
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-[60]">
      <Button
        onClick={toggleChat}
        size="lg"
        className={cn(
          "size-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "flex items-center justify-center relative group",
          isOpen && "bg-primary/80"
        )}
        aria-label={isOpen ? t('chat.floatingButton.closeChat') : t('chat.floatingButton.openChat')}
      >
        <div className="relative">
          {isOpen ? (
            <X size={24} className="transition-transform duration-200" />
          ) : (
            <MessageCircle size={24} className="transition-transform duration-200 group-hover:scale-110" />
          )}
        </div>
        
        {/* Unread messages badge */}
        {hasUnreadMessages && unreadCount > 0 && !isOpen && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 size-6 rounded-full p-0 flex items-center justify-center text-xs font-bold border-2 border-background animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}

        {/* Pulse animation for new messages */}
        {hasUnreadMessages && !isOpen && (
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        )}
      </Button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Chat with AI Assistant
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

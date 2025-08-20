"use client";

import React, { useEffect, useRef } from 'react';
import { X, Bot, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { MessageList, MessageInput } from '.';

export function ChatPopup() {
  const {
    isOpen,
    closeChat,
    clearConversation,
    markAsRead,
    currentConversation,
    isClient
  } = useChat();

  const hasMarkedAsReadRef = useRef(false);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && isClient) {
      if (!hasMarkedAsReadRef.current) {
        markAsRead();
        hasMarkedAsReadRef.current = true;
      }
    } else {
      // Reset when chat is closed
      hasMarkedAsReadRef.current = false;
    }
  }, [isOpen, isClient]); // Stable dependencies

  // Don't render anything during SSR or when closed
  if (!isClient || !isOpen) {
    return null;
  }

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation? This action cannot be undone.')) {
      clearConversation();
    }
  };

  return (
    <div className="fixed bottom-24 left-6 z-[60]">
      <div 
        className={cn(
          "bg-background border rounded-lg shadow-2xl",
          "w-96 h-[500px] max-h-[80vh]",
          "flex flex-col",
          "animate-in slide-in-from-bottom-4 duration-300",
          "sm:w-80 sm:h-[450px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {currentConversation?.messages.length || 0} messages
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Clear conversation button */}
            {currentConversation?.messages && currentConversation.messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="size-8 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Clear conversation"
              >
                <Trash2 size={14} />
              </Button>
            )}
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="size-8"
              aria-label="Close chat"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList />
        </div>

        {/* Input area */}
        <div className="border-t bg-muted/20">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

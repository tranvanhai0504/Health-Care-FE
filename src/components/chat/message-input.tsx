"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, canSendMessage, isLoading, isClient } = useChat();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Focus textarea when component mounts
  useEffect(() => {
    if (isClient && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !canSendMessage) return;

    // Clear input immediately for better UX
    setMessage('');
    
    try {
      await sendMessage(trimmedMessage);
    } catch (error) {
      // Error is handled in the store, just restore the message if needed
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow pasting but limit the total length
    const pastedText = e.clipboardData.getData('text');
    const newText = message + pastedText;
    
    if (newText.length > 2000) {
      e.preventDefault();
      setMessage(newText.slice(0, 2000));
    }
  };

  if (!isClient) {
    return null;
  }

  const isDisabled = !canSendMessage || isLoading;
  const isEmpty = !message.trim();

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none pr-12",
              "focus-visible:ring-1 focus-visible:ring-primary",
              isDisabled && "opacity-50"
            )}
            disabled={isDisabled}
            maxLength={2000}
          />
          
          {/* Character counter */}
          {message.length > 1800 && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-1 rounded">
              {message.length}/2000
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          size="icon"
          disabled={isDisabled || isEmpty}
          className={cn(
            "size-10 flex-shrink-0",
            "transition-all duration-200",
            !isDisabled && !isEmpty && "hover:scale-105"
          )}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>
      
      {/* Helper text */}
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>
          {isLoading ? 'Sending...' : 'Press Enter to send, Shift+Enter for new line'}
        </span>
        {message.length > 0 && (
          <span className={cn(
            message.length > 1900 && "text-orange-500",
            message.length >= 2000 && "text-destructive"
          )}>
            {message.length}/2000
          </span>
        )}
      </div>
    </form>
  );
}

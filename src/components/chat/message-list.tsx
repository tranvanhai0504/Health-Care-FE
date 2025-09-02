"use client";

import React, { useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { MessageItem } from './message-item';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ScheduleFormData {
  dayOffset: number;
  packageId: string;
  status: string;
  timeOffset: number;
  type: string;
  weekPeriod: {
    from: string;
    to: string;
  };
}

export function MessageList() {
  const { 
    messages, 
    isLoading, 
    isTyping, 
    sendMessage,
    isClient 
  } = useChat();
  const { t } = useTranslation();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, isLoading, isTyping]);

  // Handle retry for failed messages
  const handleRetry = async (messageId: string) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (failedMessage) {
      await sendMessage(failedMessage.content);
    }
  };

  // Handle schedule confirmation
  const handleScheduleConfirm = async (formData: ScheduleFormData) => {
    // TODO: Implement the actual schedule confirmation logic
    // This will make the API call to create/update the schedule
    console.log('Schedule confirmation:', formData);
    
    // For now, just send a confirmation message
    await sendMessage(t("chat.scheduleConfirmation.confirmed", {
      type: formData.type,
      date: new Date(formData.weekPeriod.from).toLocaleDateString()
    }));
  };

  // Welcome message suggestions
  const welcomeSuggestions = [
    t("chat.suggestions.bookAppointment"),
    t("chat.suggestions.services"),
    t("chat.suggestions.doctors"),
    t("chat.suggestions.hours")
  ];

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-2 space-y-1"
    >
      {/* Welcome message when no messages */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 pt-60 pb-60">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 py-2">
            <Bot size={24} className="text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{t("chat.welcome")}</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            {t("chat.welcomeMessage")}
          </p>
          
          {/* Suggestion buttons */}
          <div className="space-y-2 w-full max-w-xs">
            <p className="text-xs text-muted-foreground mb-3">{t("chat.tryAsking")}</p>
            {welcomeSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border border-border",
                  "hover:bg-muted/50 transition-colors duration-200",
                  "text-sm text-foreground"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onRetry={handleRetry}
          onScheduleConfirm={handleScheduleConfirm}
        />
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3 p-3">
          <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
            <Bot size={16} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="bg-muted rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-1">
                <Sparkles size={14} className="text-primary animate-pulse" />
                <span className="text-muted-foreground">AI is thinking...</span>
              </div>
              <div className="flex gap-1 mt-1">
                <div className="size-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="size-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="size-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

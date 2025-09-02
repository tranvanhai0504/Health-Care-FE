"use client";

import React from 'react';
import { Bot, User, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ChatMessage, ChatRole, MessageStatus, ScheduleFormData } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScheduleConfirmation } from './schedule-confirmation';
import Image from 'next/image';

interface MessageItemProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
  onScheduleConfirm: (formData: ScheduleFormData) => void;
}

export function MessageItem({ message, onRetry, onScheduleConfirm }: MessageItemProps) {
  const isUser = message.role === ChatRole.USER;
  const isFailed = message.status === MessageStatus.FAILED;
  const isSending = message.status === MessageStatus.SENDING;

  const formatTime = (timestamp: Date) => {
    try {
      // Ensure we have a valid Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }

      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.SENDING:
        return <Clock size={12} className="text-muted-foreground animate-pulse" />;
      case MessageStatus.SENT:
        return <CheckCircle size={12} className="text-muted-foreground" />;
      case MessageStatus.FAILED:
        return <AlertCircle size={12} className="text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex gap-3 p-3 group",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "size-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message content */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message bubble */}
        <div className={cn(
          "rounded-lg px-3 py-2 text-sm break-words",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-foreground",
          isFailed && "bg-destructive/10 border border-destructive/20",
          isSending && "opacity-70"
        )}>
          {message.imageUrl && (
            <div className={cn("mb-2", isUser ? "-mx-1" : "-mx-1")}>
              <Image
                src={message.imageUrl}
                width={100}
                height={100}
                alt="User attachment"
                className={cn(
                  "rounded border",
                  isUser ? "max-h-52" : "max-h-52"
                )}
              />
            </div>
          )}
          {message.content}
          
          {/* Form response for schedule confirmation */}
          {!isUser && message.formResponse && message.formResponse.type === "form" && (
            <div className="mt-3">
              <ScheduleConfirmation
                formData={message.formResponse.data}
                onConfirm={onScheduleConfirm}
              />
            </div>
          )}
          
          {/* Error message */}
          {isFailed && message.error && (
            <div className="mt-2 text-xs text-destructive">
              {message.error}
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {isUser && getStatusIcon()}
          
          {/* Retry button for failed messages */}
          {isFailed && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRetry(message.id)}
              className="h-auto p-1 text-xs hover:text-primary"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

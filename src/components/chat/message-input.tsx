"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export function MessageInput() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if ((!trimmedMessage && !imageFile) || !canSendMessage) return;

    // Clear input immediately for better UX
    setMessage('');
    // keep preview until send resolves to avoid flicker; we'll clear after
    
    try {
      await sendMessage(trimmedMessage, imageFile);
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const clearSelectedImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
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
  const isEmpty = !message.trim() && !imageFile;

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="flex gap-2 items-end">
        {/* Image picker */}
        <div className="flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={isDisabled}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-10"
            disabled={isDisabled}
            onClick={handleImageButtonClick}
            aria-label={t('chat.messageInput.attachImage')}
          >
            <ImageIcon size={18} />
          </Button>
        </div>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={t('chat.messageInput.placeholder')}
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
        
        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          disabled={isDisabled || isEmpty}
          className={cn(
            "size-10 flex-shrink-0",
            "transition-all duration-200",
            !isDisabled && !isEmpty && "hover:scale-105"
          )}
          aria-label={t('chat.messageInput.sendMessage')}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </div>
      
      {/* Image preview */}
      {imagePreview && (
        <div className="mt-2 relative inline-block">
          <Image
            src={imagePreview}
            alt={t('chat.messageInput.selectedImage')}
            width={96}
            height={96}
            className="max-h-24 rounded border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={clearSelectedImage}
            className="absolute -top-2 -right-2 size-6 rounded-full"
            aria-label={t('chat.messageInput.removeImage')}
          >
            <X size={14} />
          </Button>
        </div>
      )}
      
      {/* Helper text */}
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>
          {isLoading ? t('chat.messageInput.sending') : t('chat.messageInput.sendInstructions')}
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

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useChat } from "@/hooks/useChat";
import { MessageItem } from "./message-item";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { scheduleService } from "@/services/schedule.service";
import { Schedule, ScheduleStatus } from "@/types";
import { ScheduleResponse } from "@/types/schedule";
import { getScheduleDate } from "@/utils/formatters";

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
  const { messages, isLoading, isTyping, sendMessage, isClient } = useChat();
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Track confirmed schedules to prevent double confirmation (local state for immediate feedback)
  const [confirmedSchedules, setConfirmedSchedules] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isLoading, isTyping]);

  // Handle retry for failed messages
  const handleRetry = async (messageId: string) => {
    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (failedMessage) {
      await sendMessage(failedMessage.content);
    }
  };

  // Check if a schedule already exists in the database
  const checkExistingSchedule = async (formData: ScheduleFormData): Promise<boolean> => {
    if (!user || !user._id) return false;
    
    try {
      // Calculate the same parameters that would be used for the schedule
      const weekPeriod = scheduleService.getWeekPeriod(new Date(formData.weekPeriod.from));
      const dayOffset = scheduleService.getDayOffset(new Date(formData.weekPeriod.from));
      const timeOffset = formData.timeOffset;

      // Check if a schedule already exists with these parameters
      const existingSchedulesResponse = await scheduleService.getUserSchedules();
      const existingSchedules = existingSchedulesResponse.data;
      
      return existingSchedules.some((schedule: ScheduleResponse) => 
        schedule.packageId === formData.packageId &&
        schedule.dayOffset === dayOffset &&
        schedule.timeOffset === timeOffset &&
        schedule.weekPeriod.from === weekPeriod.from &&
        schedule.weekPeriod.to === weekPeriod.to &&
        schedule.status === ScheduleStatus.CONFIRMED
      );
    } catch (error) {
      console.error("Error checking existing schedule:", error);
      return false; // If we can't check, allow the booking to proceed
    }
  };

  // Handle schedule confirmation
  const handleScheduleConfirm = async (formData: ScheduleFormData) => {
    // Check if user is authenticated
    if (!user || !user._id) {
      toast.error(t("dashboard.booking.errors.userInfoNotAvailable"));
      return;
    }

    // Create a unique key for this schedule to prevent double confirmation (immediate feedback)
    const scheduleKey = `${formData.packageId}-${formData.dayOffset}-${formData.timeOffset}`;
    
    // Check local state first for immediate feedback
    if (confirmedSchedules.has(scheduleKey)) {
      toast.warning(t("chat.scheduleConfirmation.alreadyConfirmed"));
      return;
    }

    // Check database for existing schedule (persistent check)
    const scheduleExists = await checkExistingSchedule(formData);
    if (scheduleExists) {
      toast.warning(t("chat.scheduleConfirmation.alreadyConfirmed"));
      return;
    }

    try {
      console.log(formData);
      // Calculate week period and day offset (UTC-based)
      const weekPeriod = {
        from: new Date(formData.weekPeriod.from),
        to: new Date(formData.weekPeriod.to),
      };
      const dayOffset = formData.dayOffset
      const timeOffset = formData.timeOffset;

      // Create booking data
      const bookingData: Partial<Schedule> = {
        userId: user._id,
        weekPeriod: weekPeriod,
        dayOffset: dayOffset,
        timeOffset: timeOffset as 0 | 1,
        status: ScheduleStatus.CONFIRMED,
        type: "package",
        packageId: formData.packageId,
        services: [],
      };

      // Submit booking
      await scheduleService.create(bookingData);

      // Mark this schedule as confirmed
      setConfirmedSchedules(prev => new Set(prev).add(scheduleKey));

      // Show success message
      toast.success(t("dashboard.booking.success.bookingCreated"));

      // Send confirmation message to chat
      const actualDate = getScheduleDate(formData.weekPeriod, formData.dayOffset);
      await sendMessage(t("chat.scheduleConfirmation.confirmed", {
        type: formData.type,
        date: actualDate.toLocaleDateString()
      }));

      // Redirect to schedules page after a short delay
      setTimeout(() => {
        router.push("/schedules");
      }, 2000);

    } catch (err) {
      console.error("Error creating schedule:", err);
      toast.error(t("dashboard.booking.errors.bookingFailed"));
    }
  };

  // Welcome message suggestions
  const welcomeSuggestions = [
    t("chat.suggestions.bookAppointment"),
    t("chat.suggestions.services"),
    t("chat.suggestions.doctors"),
    t("chat.suggestions.hours"),
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
            <p className="text-xs text-muted-foreground mb-3">
              {t("chat.tryAsking")}
            </p>
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
                <div
                  className="size-2 bg-muted-foreground/40 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="size-2 bg-muted-foreground/40 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="size-2 bg-muted-foreground/40 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
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

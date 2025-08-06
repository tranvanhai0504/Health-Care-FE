import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon, Loader2 } from "lucide-react";
import { waitingMessageService } from "@/services/waittingMessage.service";
import { useAuth } from "@/hooks/useAuth";
import { WaitingMessage } from "@/types/waitingMessage";
import { formatDistanceToNow, parseISO } from "date-fns";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  status: 'pending' | 'sent' | 'failed';
}

interface NotificationsProps {
  count?: number;
}

// Helper function to map WaitingMessage to NotificationItem
const mapWaitingMessageToNotification = (waitingMessage: WaitingMessage): NotificationItem => {
  const getTitle = (status: WaitingMessage['status']) => {
    switch (status) {
      case 'pending':
        return 'Upcoming Reminder';
      case 'sent':
        return 'Message Sent';
      case 'failed':
        return 'Message Failed';
      default:
        return 'Notification';
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      console.warn('Failed to format relative time:', dateString, error);
      return 'Recently';
    }
  };

  return {
    id: waitingMessage._id,
    title: getTitle(waitingMessage.status),
    message: waitingMessage.message,
    time: getRelativeTime(waitingMessage.triggerAt),
    status: waitingMessage.status,
  };
};

const Notifications = ({ count }: NotificationsProps) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate notification count from fetched data
  const notificationCount = count ?? notifications.length;

  // Fetch user's waiting messages
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const waitingMessages = await waitingMessageService.getUserMessages();
      const mappedNotifications = waitingMessages
        .map(mapWaitingMessageToNotification)
        .sort((a, b) => {
          // Sort by status priority (pending first) then by time
          const statusPriority = { pending: 0, sent: 1, failed: 2 };
          const aStatusPriority = statusPriority[a.status];
          const bStatusPriority = statusPriority[b.status];
          
          if (aStatusPriority !== bStatusPriority) {
            return aStatusPriority - bStatusPriority;
          }
          
          // If same status, sort by time (most recent first for sent/failed, soonest first for pending)
          return a.status === 'pending' ? 0 : -1;
        });
        
      setNotifications(mappedNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch notifications when component mounts or authentication changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getStatusColor = (status: NotificationItem['status']) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600';
      case 'sent':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild suppressHydrationWarning>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {!isAuthenticated ? (
            <div className="py-4 px-4 text-center">
              <p className="text-sm text-muted-foreground">
                Please sign in to view notifications
              </p>
            </div>
          ) : error ? (
            <div className="py-4 px-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={fetchNotifications}
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 && !loading ? (
            <div className="py-4 px-4 text-center">
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer py-3 px-4">
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <span className={`text-xs ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {notification.time}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer justify-center text-sm text-primary"
              onClick={fetchNotifications}
            >
              Refresh notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { Notifications }; 
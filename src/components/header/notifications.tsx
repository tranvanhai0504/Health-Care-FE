import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BellIcon } from "lucide-react";

interface NotificationsProps {
  count?: number;
  notifications?: Array<{
    id: number;
    title: string;
    message: string;
    time: string;
  }>;
}

const Notifications = ({ 
  count = 0, 
  notifications = [
    { id: 1, title: "Appointment Reminder", message: "Your appointment with Dr. Smith is tomorrow at 10:00 AM", time: "2 hours ago" },
    { id: 2, title: "Appointment Reminder", message: "Your appointment with Dr. Smith is tomorrow at 10:00 AM", time: "2 hours ago" },
    { id: 3, title: "Appointment Reminder", message: "Your appointment with Dr. Smith is tomorrow at 10:00 AM", time: "2 hours ago" }
  ] 
}: NotificationsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="cursor-pointer py-3 px-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground/70">{notification.time}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center text-sm text-primary">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { Notifications }; 
import React from "react";
import Link from "next/link";
// Button import removed as it's not used in this file
import { Calendar } from "lucide-react";

const ScheduleButton = () => {
  return (
    <Link href="/schedules">
      <Calendar className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
    </Link>
  );
};

export { ScheduleButton }; 
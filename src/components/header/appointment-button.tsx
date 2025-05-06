import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

const AppointmentButton = () => {
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/appointments">
        <CalendarIcon className="h-5 w-5" />
      </Link>
    </Button>
  );
};

export { AppointmentButton }; 
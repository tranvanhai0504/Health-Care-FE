"use client";

import React from "react";
import { Logo } from "@/components/header/logo";
import { MainNav } from "@/components/header/main-nav";
import { Notifications } from "@/components/header/notifications";
import { ScheduleButton } from "@/components/header/schedule-button";
import { UserProfile } from "@/components/header/user-profile";
import { AuthButtons } from "@/components/header/auth-buttons";
import { LanguageSelector } from "@/components/header/language-selector";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isNotDashboard = pathname.includes("/admin") || pathname.includes("/doctor");

  return (
    <header className="!fixed top-0 left-0 right-0 z-50 border-b bg-background px-4">
      <div
        className={cn(
          "flex h-16 items-center justify-between w-full",
          !isNotDashboard && "max-w-7xl px-10 mx-auto"
        )}
      >
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Logo />

          {/* Main Navigation */}
          <MainNav />
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector />

          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Notifications />

              {/* Schedules shortcut */}
              <ScheduleButton />

              {/* User profile */}
              <UserProfile user={user} />
            </>
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import React from "react";
import { Logo } from "@/components/header/logo";
import { MainNav } from "@/components/header/main-nav";
import { Notifications } from "@/components/header/notifications";
import { ScheduleButton } from "@/components/header/schedule-button";
import { UserProfile } from "@/components/header/user-profile";
import { AuthButtons } from "@/components/header/auth-buttons";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="!fixed top-0 left-0 right-0 z-50 border-b bg-background px-10">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Logo />

          {/* Main Navigation */}
          <MainNav />
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <Notifications count={3} />

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

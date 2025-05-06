"use client";

import React from "react";
import Image from "next/image";
import { CalendarIcon, UserIcon, ShieldCheckIcon, HeartPulseIcon } from "lucide-react";

interface SetupLayoutProps {
  children: React.ReactNode;
}

const SetupLayout = ({ children }: SetupLayoutProps) => {
  return (
    <div className="h-screen bg-gradient-to-b from-primary/5 to-background relative overflow-hidden flex items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-70" />
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl opacity-70" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl opacity-70" />
      
      {/* Medical icons background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10">
          <HeartPulseIcon className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute top-20 right-20">
          <ShieldCheckIcon className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute bottom-20 left-1/4">
          <CalendarIcon className="h-14 w-14 text-primary" />
        </div>
        <div className="absolute bottom-40 right-1/4">
          <UserIcon className="h-10 w-10 text-primary" />
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-6 px-4 w-full max-w-2xl mx-auto relative z-10">
        <div className="w-full max-w-xl space-y-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-white/20">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Image src="/logos/logo.svg" alt="logo" width={32} height={32} className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xl font-bold text-primary">HealthCare</p>
              <p className="text-xs text-muted-foreground">Your health, our priority</p>
            </div>
          </div>
          
          {children}
        </div>
        
        {/* Steps indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-primary"></div>
          <div className="w-16 h-1 rounded-full bg-primary"></div>
          <div className="size-2.5 rounded-full bg-primary/30"></div>
          <div className="w-16 h-1 rounded-full bg-primary/30"></div>
          <div className="size-2.5 rounded-full bg-primary/30"></div>
        </div>
      </div>
    </div>
  );
};

export default SetupLayout;

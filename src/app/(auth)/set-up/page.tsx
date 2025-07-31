"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MoveRight, Sparkles, Clock, LucideShieldCheck } from "lucide-react";

const WelcomePage = () => {
  const router = useRouter();

  const handleStart = () => {
    router.push("/set-up/password");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight text-gray-800">
          Welcome to HealthCare
        </h1>
        <p className="text-sm text-muted-foreground">
          Let&apos;s get you set up in just a few simple steps
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Personalized Care</h3>
              <p className="text-xs text-muted-foreground">
                Get healthcare recommendations tailored to your needs
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">Quick Setup</h3>
              <p className="text-xs text-muted-foreground">
                Complete your profile in less than 3 minutes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <LucideShieldCheck className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">Secure & Private</h3>
            <p className="text-xs text-muted-foreground">
              Your health information is protected with top-tier security
              standards
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleStart}
          className="w-full py-5 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary group"
        >
          Get Started
          <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="underline text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline text-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;

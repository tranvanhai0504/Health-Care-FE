"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AuthButtons = () => {
  const { isLoading } = useAuth();

  return (
    <>
      <Button variant="ghost" asChild disabled={isLoading}>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild disabled={isLoading}>
        <Link href="/register">Sign Up</Link>
      </Button>
    </>
  );
};

export { AuthButtons }; 
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * A wrapper component for routes that require authentication.
 * Redirects to login page if user is not authenticated.
 * Can also check for specific roles if allowedRoles is provided.
 */
export default function ProtectedRoute({ 
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
    
    // If authenticated but role check failed, redirect to unauthorized page
    if (!isLoading && isAuthenticated && allowedRoles && user) {
      const hasAllowedRole = allowedRoles.includes(user.role);
      if (!hasAllowedRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, router, user, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Role check for authenticated users
  if (isAuthenticated && allowedRoles && user) {
    const hasAllowedRole = allowedRoles.includes(user.role);
    if (!hasAllowedRole) {
      return null; // Component will redirect in the useEffect
    }
  }

  // If authenticated (and role check passed if applicable), render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, show nothing (redirect will happen in the useEffect)
  return null;
} 
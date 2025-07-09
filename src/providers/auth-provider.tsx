"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    token, 
    fetchProfile, 
    isAuthenticated, 
    loading, 
    user,
    initializeFromStorage
  } = useAuthStore();
  
  // Initialize from localStorage on mount (after hydration)
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);
  
  // Load user on initial mount or token change (only if we don't have user data)
  useEffect(() => {
    // If we have a token but no authenticated user and no user data, try loading the user
    if (token && !isAuthenticated && !user && !loading) {
      fetchProfile();
    }
  }, [token, isAuthenticated, user, loading, fetchProfile]);

  // Removed the aggressive route-change profile checking that was causing logouts
  // The token verification will only happen:
  // 1. On initial load from localStorage
  // 2. When we have a token but no user data
  // This prevents unnecessary API calls and automatic logouts on navigation

  return <>{children}</>;
} 
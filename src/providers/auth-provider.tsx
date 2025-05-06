"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    token, 
    fetchProfile, 
    isAuthenticated, 
    loading, 
    user 
  } = useAuthStore();
  
  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !token && !isAuthenticated && !user) {
      const jwtToken = localStorage.getItem('jwt_token');
      const authStorageStr = localStorage.getItem('auth-storage');
      
      if (jwtToken && authStorageStr) {
        try {
          // Parse the stored auth data
          const authStorage = JSON.parse(authStorageStr);
          if (authStorage?.state?.token) {
            // We have a saved token, try to load the user profile
            fetchProfile();
          }
        } catch (error) {
          console.error('Error parsing auth data from localStorage', error);
        }
      }
    }
  }, [token, isAuthenticated, user, fetchProfile]);
  
  // Load user on initial mount or token change
  useEffect(() => {
    // If we have a token but no authenticated user, try loading the user
    if (token && !isAuthenticated && !loading) {
      fetchProfile();
    }
  }, [token, isAuthenticated, loading, fetchProfile]);
  
  // Check for token expiration or validation issues on route changes
  useEffect(() => {
    // If we have a token and we're authenticated, verify token on route changes
    // This helps catch token expiration between page navigations
    if (token && isAuthenticated) {
      fetchProfile();
    }
  }, [pathname, token, isAuthenticated, fetchProfile]);

  return <>{children}</>;
} 
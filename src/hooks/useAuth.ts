"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { LoginCredentials } from "@/services/auth";
import { useToast } from "@/hooks/useToast";
import { useLoginModal } from "@/hooks/useLoginModal";

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const { openModal } = useLoginModal();
  
  const {
    user,
    isAuthenticated,
    loading,
    token,
    signin,
    signout,
    signup,
    fetchProfile
  } = useAuthStore();

  // Initialize auth state from localStorage on client-side
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated && !token) {
      const storedAuthData = localStorage.getItem('auth-storage');
      if (storedAuthData) {
        try {
          const { state } = JSON.parse(storedAuthData);
          if (state.token) {
            // If there's a token in storage but our state doesn't have it,
            // fetch the user profile to validate and update state
            fetchProfile();
          }
        } catch (error) {
          console.error('Error parsing auth data from localStorage', error);
        }
      }
    }
  }, [isAuthenticated, token, fetchProfile]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await signin(credentials);
        toast({
          title: "Login successful",
          description: "Welcome back!",
          type: "success",
        });
        return true;
      } catch (error) {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Please check your credentials",
          type: "error",
        });
        return false;
      }
    },
    [signin, toast]
  );

  const logout = useCallback(async () => {
    await signout();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
      type: "success",
    });
    router.push("/login");
  }, [signout, toast, router]);

  // Function to check if user is authenticated and show login modal if not
  const authenticateAction = useCallback((callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      openModal({
        afterLogin: callback
      });
    }
  }, [isAuthenticated, openModal]);

  return {
    user,
    isAuthenticated,
    isLoading: loading,
    token,
    login,
    logout,
    signup,
    refreshProfile: fetchProfile,
    authenticateAction
  };
} 
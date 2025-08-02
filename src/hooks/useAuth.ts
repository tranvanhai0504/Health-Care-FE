"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { LoginCredentials } from "@/types";
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
    createUser,
    fetchProfile
  } = useAuthStore();

  // Fetch profile if we have a token but no user data
  useEffect(() => {
    if (token && isAuthenticated && !user && !loading) {
      fetchProfile();
    }
  }, [token, isAuthenticated, user, loading, fetchProfile]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await signin(credentials);
        toast({
          title: "Login successful",
          description: "Welcome back!",
          type: "success",
        });
        
        // Return success and user data for immediate use
        return { success: true, user: useAuthStore.getState().user };
      } catch (error) {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Please check your credentials",
          type: "error",
        });
        return { success: false, user: null };
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
    createUser,
    refreshProfile: fetchProfile,
    authenticateAction
  };
} 
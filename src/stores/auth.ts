import { create } from "zustand";
import authService from "@/services/auth.service";
import { UserProfile } from "@/types";
import api from "@/lib/axios";
import { AuthState, CreateUserData } from "@/types/auth";
import { AxiosError } from "axios";

export const useAuthStore = create<AuthState>((set, get) => {
  return {
    user: null,
    isAuthenticated: false,
    loading: true,
    token: null,

    initializeFromStorage: () => {
      if (typeof window !== 'undefined') {
        const jwtToken = localStorage.getItem('jwt_token');
        const authStorageStr = localStorage.getItem('auth-storage');

        if (jwtToken && authStorageStr) {
          try {
            const authStorage = JSON.parse(authStorageStr);
            if (authStorage?.state?.token) {
              const token = authStorage.state.token;
              const user = authStorage.state.user || null;

              console.log('Initializing auth from storage:', { token: !!token, user: !!user });

              set({
                token,
                user,
                isAuthenticated: true,
                loading: false, // Ensure loading is false after initialization
              });

              // Set authorization header
              api.defaults.headers.common.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Error parsing auth storage', error);
            // Clear invalid storage
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('auth-storage');
          }
        } else {
          // No valid auth data found, ensure we're not loading
          set({ loading: false });
        }
      }
    },

    createUser: async (data: CreateUserData) => {
      set({ loading: true });
      try {
        const response = await authService.createUser(data);
        if (response.data.authenToken) {
          const token = response.data.authenToken;

          // Save token to localStorage
          localStorage.setItem("jwt_token", token);
          localStorage.setItem(
            "auth-storage",
            JSON.stringify({
              state: { token, isAuthenticated: true, user: null },
            })
          );

          set({
            token,
            isAuthenticated: true,
          });
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Signup error:", err);
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    signin: async (credentials) => {
      set({ loading: true });
      try {
        const response = await authService.login(credentials);

        const token = response.data.authenToken;

        // Save token to localStorage
        localStorage.setItem("jwt_token", token);

        const userData: UserProfile = {
          _id: response.data._id ?? "",
          name: response.data.name ?? null,
          email: response.data.email ?? null,
          role: response.data.role ?? "",
          phoneNumber: response.data.phoneNumber ?? "",
          address: response.data.address ?? null,
          dateOfBirth: response.data.dateOfBirth ?? null,
          gender: response.data.gender ?? null,
          occupation: response.data.occupation ?? null,
          createdAt: response.data.createdAt ?? "",
          updatedAt: response.data.updatedAt ?? "",
        };

        // Save state to auth-storage
        localStorage.setItem(
          "auth-storage",
          JSON.stringify({
            state: { token, isAuthenticated: true, user: userData },
          })
        );

        set({
          token,
          user: userData,
          isAuthenticated: true,
        });

        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error("Login error:", err);
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    signout: async () => {
      set({ loading: true });
      try {
        await authService.logout();
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        // Clean up localStorage
        api.defaults.headers.common.Authorization = "";
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth-storage");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    },

    fetchProfile: async () => {
      const currentState = get();

      // Don't fetch if already loading or no token
      if (currentState.loading || !currentState.token) {
        return;
      }

      set({ loading: true });
      try {
        const userData = await authService.getProfile();

        // Update auth-storage with new user data
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          localStorage.setItem(
            "auth-storage",
            JSON.stringify({
              ...parsed,
              state: { ...parsed.state, user: userData },
            })
          );
        }

        set({ user: userData, isAuthenticated: true, loading: false });
      } catch (err: unknown) {
        console.error("Fetch profile error:", err);

        // Only logout for authentication-related errors (401, 403)
        // Don't logout for network errors, server errors, etc.
        let isAuthError = false;

        if (err instanceof AxiosError) {
          isAuthError = err.response?.status === 401 || err.response?.status === 403;
        }

        if (isAuthError) {
          console.log("Authentication error detected, logging out user");
          // Clear auth state and storage
          api.defaults.headers.common.Authorization = "";
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("auth-storage");

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        } else {
          console.log("Non-auth error occurred, keeping user logged in");
          // For non-auth errors, just mark as not loading but keep user authenticated
          set({ loading: false });
        }
      }
    },
  };
});

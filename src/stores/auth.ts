import { create } from "zustand";
import authService, { UserProfile } from "@/services/auth";
import api from "@/lib/axios";
import { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize store state from localStorage if available
  let initialToken: string | null = null;
  let initialUser: UserProfile | null = null;
  let initialIsAuthenticated = false;

  // Only run in browser environment
  if (typeof window !== 'undefined') {
    // Check for token in localStorage
    const jwtToken = localStorage.getItem('jwt_token');
    const authStorageStr = localStorage.getItem('auth-storage');
    
    if (jwtToken && authStorageStr) {
      try {
        const authStorage = JSON.parse(authStorageStr);
        if (authStorage?.state?.token) {
          initialToken = authStorage.state.token;
          initialIsAuthenticated = true;
          
          // Also grab the user if available
          if (authStorage.state.user) {
            initialUser = authStorage.state.user;
          }
          
          // Set authorization header
          api.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage', error);
      }
    }
  }

  return {
    user: initialUser,
    isAuthenticated: initialIsAuthenticated,
    loading: false,
    token: initialToken,

    signup: async (data) => {
      set({ loading: true });
      try {
        const response = await authService.register(data);
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

        set({ user: userData });
      } catch (err) {
        console.error("Fetch profile error:", err);
        if (get().isAuthenticated) {
          get().signout();
        }
      } finally {
        set({ loading: false });
      }
    },
  };
});

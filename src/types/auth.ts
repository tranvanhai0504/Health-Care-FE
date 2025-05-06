import { LoginCredentials, UserProfile } from "@/services/auth";
import { SignUpFormType } from "@/schemas/sign-up";

// Auth storage type
export interface AuthStorage {
  state: {
    token: string;
    isAuthenticated: boolean;
    user: UserProfile | null;
  };
}

// Auth context type
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  signup: (data: SignUpFormType) => Promise<void>;
  signin: (credentials: LoginCredentials) => Promise<void>;
  signout: () => Promise<void>;
} 
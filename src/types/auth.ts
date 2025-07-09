import { SignUpFormType } from "@/schemas/sign-up";
import { ApiResponse } from "./api";

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

/**
 * Auth data interface
 */
export type AuthData = {
  authenToken: string;
  user?: UserProfile;
  // For login, the user properties are directly on the data object
  name?: string | null;
  email?: string | null;
  role?: string;
  phoneNumber?: string;
  occupation?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Auth response type
 */
export type AuthResponse = ApiResponse<AuthData>;

/**
 * OTP verification data interface
 */
export interface OTPVerificationData {
  code: string;
  phoneNumber: string;
}

/**
 * OTP verification response type
 */
export type OTPVerificationResponse = ApiResponse<{
  token?: string;
}>;

/**
 * Create user data interface
 */
export interface CreateUserData {
  phoneNumber: string;
  password: string;
  // Add other required fields based on your API
}

/**
 * User profile interface
 */
export interface UserProfile {
  _id: string;
  name: string | null;
  email: string | null;
  role: string;
  phoneNumber: string;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  occupation: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  initializeFromStorage: () => void;
  fetchProfile: () => Promise<void>;
  signup: (data: SignUpFormType) => Promise<void>;
  signin: (credentials: LoginCredentials) => Promise<void>;
  signout: () => Promise<void>;
} 
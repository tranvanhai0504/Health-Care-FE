import api from "@/lib/axios";
import { SignUpFormType } from "@/schemas/sign-up";
import { ApiResponse } from "./base";

export interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

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

export type AuthResponse = ApiResponse<AuthData>;

export interface OTPVerificationData {
  code: string;
  phoneNumber: string;
}

export type OTPVerificationResponse = ApiResponse<{
  token?: string;
}>;

export interface CreateUserData {
  phoneNumber: string;
  password: string;
  // Add other required fields based on your API
}

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

const authService = {
  /**
   * Register a new user
   */
  register: async (data: SignUpFormType) => {
    const response = await api.post<AuthResponse>(
      "/api/v1/auth/register",
      data
    );
    return response.data;
  },

  /**
   * Verify OTP during registration
   */
  verifyOTP: async (data: OTPVerificationData) => {
    const response = await api.post<OTPVerificationResponse>(
      "/api/v1/auth/verify-otp",
      data
    );
    return response.data;
  },

  /**
   * Log in a user
   */
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>(
      "/api/v1/auth/login",
      credentials
    );
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    const response = await api.post<ApiResponse<void>>("/api/v1/auth/logout");
    return response.data;
  },

  /**
   * Get the current user's profile
   */
  getProfile: async () => {
    const response = await api.get<ApiResponse<UserProfile>>(
      "/api/v1/user/profile"
    );
    return response.data.data;
  },

  /**
   * Create a new user (admin functionality)
   */
  createUser: async (data: CreateUserData) => {
    const response = await api.post<
      ApiResponse<{ user: UserProfile; authenToken: string }>
    >("/api/v1/user", data);
    return response.data;
  },
};

export default authService;

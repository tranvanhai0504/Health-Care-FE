import api from "@/lib/axios";
import { SignUpFormType } from "@/schemas/sign-up";
import {
  LoginCredentials,
  AuthResponse,
  OTPVerificationData,
  OTPVerificationResponse,
  CreateUserData,
  UserProfile,
  ApiResponse
} from "@/types";

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
   * Change user password
   */
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/api/v1/auth/change-password",
      data
    );
    return response.data;
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

  /**
   * Refresh the authentication token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await api.post<AuthResponse>(
      "/api/v1/auth/refresh-token",
      { refreshToken }
    );
    return response.data;
  },
};

export default authService;

import authService from './auth';
import { appointmentService } from './appointment';
import { consultationPackageService } from './consultationPackage';
import { consultationServiceApi } from './consultationService';
import { doctorService } from './doctor';
import { userService } from './user';
import { roomService } from './room';
import { scheduleService } from './schedule';
import { periodPackageService } from './periodPackage';
import { dayPackageService } from './dayPackage';
import { weeklyPackageService } from './weeklyPackage';
import { BlogService } from './blogs';
import { ApiResponse } from './base';

// Export the ApiResponse interface for use throughout the app
export type { ApiResponse };

// Create blog service instance
const blogService = new BlogService();

// Helper function to get latest blog posts
export const getLatestBlogPosts = (limit?: number) => blogService.getLatestBlogPosts(limit);

export {
  authService,
  appointmentService,
  consultationPackageService,
  consultationServiceApi,
  doctorService,
  userService,
  roomService,
  scheduleService,
  periodPackageService,
  dayPackageService,
  weeklyPackageService,
  blogService
}; 
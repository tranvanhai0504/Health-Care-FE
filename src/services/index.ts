import authService from './auth.service';
import { consultationPackageService } from './consultationPackage.service';
import { consultationServiceApi } from './consultationService.service';
import { doctorService } from './doctor.service';
import { userService } from './user.service';
import { roomService } from './room.service';
import { scheduleService } from './schedule.service';
import { specialtyService } from './specialties.service';
import { BlogService } from './blogs.service';
import { prescriptionService } from './prescription.service';
import { medicalExaminationService } from './medicalExamination.service';
import { promotionService } from './promotion.service';
import { imageService } from './image.service';
import { waitingMessageService } from './waittingMessage.service';
import { paymentService } from './payment.service';
import { chatService } from './chat.service';
import { ApiResponse } from './base.service';

// Export the ApiResponse interface for use throughout the app
export type { ApiResponse };

// Create blog service instance
const blogService = new BlogService();

// Helper function to get latest blog posts
export const getLatestBlogPosts = (limit?: number) => blogService.getLatestBlogPosts(limit);

// All types are now exported from @/types

export {
  authService,
  consultationPackageService,
  consultationServiceApi,
  doctorService,
  userService,
  roomService,
  scheduleService,
  specialtyService,
  blogService,
  prescriptionService,
  medicalExaminationService,
  promotionService,
  imageService,
  waitingMessageService,
  paymentService,
  chatService
};
# Services Directory

This directory contains all the API service classes for the health care application. Each service extends the base service and provides specific functionality for different parts of the application.

## Services Overview

### Base Service
- **File**: `base.service.ts`
- **Description**: Base class that provides common CRUD operations and pagination support
- **Features**: 
  - Standard CRUD operations (getAll, getById, create, update, delete)
  - Pagination support (getPaginated, getMany)
  - Bulk operations (createMany, updateMany)

### Core Services

#### Authentication Service
- **File**: `auth.service.ts`
- **Features**: User registration, login, logout, password management, OTP verification

#### User Service
- **File**: `user.service.ts`
- **Features**: User profile management, user creation and updates

#### Doctor Service
- **File**: `doctor.service.ts`
- **Features**: Doctor profile management, search by specialization

#### Consultation Services
- **File**: `consultationService.service.ts`
- **Features**: 
  - ✅ **Pagination Support**: `/many` endpoint with pagination
  - Service management by specialization
  - Bulk create and update operations
  - Individual and batch service retrieval

#### Consultation Packages
- **File**: `consultationPackage.service.ts`
- **Features**: 
  - ✅ **Pagination Support**: `/many` endpoint with pagination
  - Package management with detailed views
  - Bulk create and update operations

#### Room Service
- **File**: `room.service.ts`
- **Features**: Room management, bulk operations

#### Schedule Service
- **File**: `schedule.service.ts`
- **Features**: 
  - ✅ **Pagination Support**: `/many` endpoint for admin/doctor views
  - User schedule management
  - Current week schedules
  - Schedules by specialization
  - Booking functionality

#### Blog Service
- **File**: `blogs.service.ts`
- **Features**: 
  - ✅ **Pagination Support**: Active blogs with pagination
  - Blog management (CRUD operations)
  - Active/inactive blog filtering
  - Latest blog posts retrieval
  - Status toggle functionality

#### Specialty Service
- **File**: `specialties.service.ts`
- **Features**: 
  - Specialty management
  - Bulk specialty creation
  - Blog relationships

### Health Management Services

#### Prescription Service
- **File**: `prescription.service.ts`
- **Features**: 
  - ✅ **NEW SERVICE**: Complete prescription management
  - Doctor prescription management
  - Patient prescription viewing
  - Payment status updates
  - Medication tracking

#### Medical Examination Service
- **File**: `medicalExamination.service.ts`
- **Features**: 
  - ✅ **NEW SERVICE**: Medical examination management
  - ✅ **Pagination Support**: Full pagination for examination records
  - ICD-10 coding support
  - Vital signs tracking
  - Subclinical test results
  - Patient examination history

#### Promotion Service
- **File**: `promotion.service.ts`
- **Features**: 
  - ✅ **NEW SERVICE**: Promotion and discount management
  - Active promotion filtering
  - Bulk promotion operations
  - Usage tracking

### Package Management Services

#### Period Package Service
- **File**: `periodPackage.service.ts`
- **Features**: Period-based package management, booking counters

#### Day Package Service
- **File**: `dayPackage.service.ts`
- **Features**: Daily package management, period package integration

#### Weekly Package Service
- **File**: `weeklyPackage.service.ts`
- **Features**: Weekly package management, day package integration

### Utility Services

#### Image Service
- **File**: `image.service.ts`
- **Features**: 
  - ✅ **NEW SERVICE**: File upload functionality
  - Single and multiple image uploads
  - Image processing options (resize, dimensions)
  - Category-based organization

#### Schedule Service (Replaces Appointments)
- **File**: `schedule.service.ts`
- **Features**: 
  - ✅ **Complete appointment/schedule management**
  - User schedule management with pagination
  - Schedule booking and cancellation
  - Current week schedules
  - Schedules by specialization
  - Enhanced booking functionality

## API Response Formats

### Standard Response
```typescript
interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}
```

### Paginated Response
```typescript
interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  success?: boolean;
  msg?: string;
}
```

### Pagination Parameters
```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}
```

## Services with Pagination Support

The following services support pagination through the `/many` endpoint:

1. **Consultation Services** - `consultationService.service.ts`
2. **Consultation Packages** - `consultationPackage.service.ts`
3. **Blogs** - `blogs.service.ts` (active blogs only)
4. **Schedule** - `schedule.service.ts` (admin/doctor view)
5. **Medical Examinations** - `medicalExamination.service.ts`
6. **Doctors** - `doctor.service.ts` ✅ **UPDATED**
7. **Users** - `user.service.ts` ✅ **UPDATED**
8. **Specialties** - `specialties.service.ts` ✅ **UPDATED**
9. **Day Packages** - `dayPackage.service.ts` ✅ **UPDATED**
10. **Weekly Packages** - `weeklyPackage.service.ts` ✅ **UPDATED**
11. **Period Packages** - `periodPackage.service.ts` ✅ **UPDATED**
12. **Prescriptions** - `prescription.service.ts` ✅ **UPDATED**
13. **Promotions** - `promotion.service.ts` ✅ **UPDATED**

## Usage Examples

### Basic CRUD Operations
```typescript
import { consultationServiceApi } from '@/services';

// Get all services
const services = await consultationServiceApi.getAll();

// Get with pagination
const paginatedServices = await consultationServiceApi.getPaginated({ page: 1, limit: 10 });

// Create service
const newService = await consultationServiceApi.create(serviceData);

// Update service
const updatedService = await consultationServiceApi.update(id, updateData);
```

### Pagination Usage
```typescript
import { 
  medicalExaminationService,
  doctorService,
  userService,
  promotionService,
  specialtyService 
} from '@/services';

// Get paginated examinations
const examinations = await medicalExaminationService.getPaginated({
  page: 1,
  limit: 20
});

// Get paginated doctors with search
const doctors = await doctorService.getPaginated({
  page: 1,
  limit: 10,
  search: 'cardiology'
});

// Get paginated users (admin only)
const users = await userService.getPaginated({
  page: 1,
  limit: 50
});

// Get paginated promotions
const promotions = await promotionService.getPaginated({
  page: 1,
  limit: 15
});

// Get paginated specialties
const specialties = await specialtyService.getPaginated({
  page: 1,
  limit: 25
});

console.log('Examinations:', examinations.data);
console.log('Total:', examinations.pagination.total);
console.log('Pages:', examinations.pagination.totalPages);
```

### File Upload
```typescript
import { imageService } from '@/services';

// Upload single image
const uploadResult = await imageService.uploadImage(file, {
  category: 'profile',
  resize: true,
  maxWidth: 800
});

// Upload multiple images
const uploadResults = await imageService.uploadMultipleImages(files);
```

## Error Handling

All services use consistent error handling through the axios interceptors configured in `@/lib/axios`. Services return promises that can be caught using standard try/catch blocks or `.catch()` methods.

## Type Safety

All services are fully typed using TypeScript interfaces defined in the `@/types` directory. This ensures type safety when working with API responses and request payloads.

## API Documentation Compliance

All services have been updated to match the backend API routes documentation, including:
- Correct endpoint paths
- Proper HTTP methods
- Pagination support where indicated
- Authentication requirements
- Role-based access control

For detailed API endpoint information, refer to the main API documentation. 
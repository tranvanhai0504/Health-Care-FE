/**
 * Promotion interface
 */
export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  code?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableServices?: string[];
  applicablePackages?: string[];
  maxUsage?: number;
  currentUsage: number;
  minPurchaseAmount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create promotion data interface
 */
export interface CreatePromotionData {
  title: string;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  code?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  applicableServices?: string[];
  applicablePackages?: string[];
  maxUsage?: number;
  minPurchaseAmount?: number;
} 
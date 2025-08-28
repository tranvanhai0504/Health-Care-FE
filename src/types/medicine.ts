// Medicine interface
export interface Medicine {
  _id?: string;
  name: string;
  dosage: string;
  form: string;
  route: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create medicine data interface
export interface CreateMedicineData {
  name: string;
  dosage: string;
  form: string;
  route: string;
}

// Update medicine data interface
export interface UpdateMedicineData {
  name?: string;
  dosage?: string;
  form?: string;
  route?: string;
}

// Filter options for medicines
export interface MedicineFilterOptions {
  name?: string;
  dosage?: string;
  form?: string;
  route?: string;
}

// Advanced options for complex filtering
export interface MedicineAdvancedOptions {
  filter?: {
    name?: {
      $regex?: string;
      $options?: string;
    };
    dosage?: {
      $regex?: string;
      $options?: string;
    };
    form?: {
      $regex?: string;
      $options?: string;
    };
    route?: {
      $regex?: string;
      $options?: string;
    };
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
  sort?: Record<string, 1 | -1>;
}

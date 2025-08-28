# Medication Service

The Medication Service provides a comprehensive interface for managing medications in the clinic system. It extends the BaseService and provides methods for CRUD operations, filtering, searching, and bulk operations.

## Features

- **CRUD Operations**: Create, read, update, and delete medications
- **Advanced Filtering**: Support for complex queries with MongoDB-style operators
- **Pagination**: Built-in pagination support for large datasets
- **Bulk Operations**: Create, update, and delete multiple medications at once
- **Search Capabilities**: Search by medicine, quantity, frequency, and duration
- **Type Safety**: Full TypeScript support with proper interfaces

## Import

```typescript
import { medicationService } from '@/services';
// or
import { medicationService } from '@/services/medication.service';

// Types are available from the main types export
import { 
  Medication, 
  CreateMedicationData, 
  UpdateMedicationData,
  Medicine 
} from '@/types';
```

## Basic Usage

### Get All Medications

```typescript
// Get all medications with default pagination
const medications = await medicationService.getAll();

// Get medications with custom pagination
const medications = await medicationService.getAll({
  page: 2,
  limit: 25
});
```

### Get Medication by ID

```typescript
const medication = await medicationService.getById('medication_id_here');
```

### Create Medication

```typescript
const newMedication = await medicationService.create({
  medicine: 'medicine_id_here',
  quantity: 10,
  frequency: '1 viên x 3 lần/ngày',
  duration: '5 ngày',
  instruction: 'Sau khi ăn'
});
```

### Update Medication

```typescript
const updatedMedication = await medicationService.update('medication_id_here', {
  quantity: 15,
  frequency: '1 viên x 2 lần/ngày'
});
```

### Delete Medication

```typescript
const result = await medicationService.delete('medication_id_here');
console.log(result.message); // "Medication deleted successfully"
```

## Advanced Filtering

### Basic Filters

```typescript
const medications = await medicationService.getWithFilters({
  medicine: 'medicine_id_here',
  minQuantity: 5,
  maxQuantity: 20,
  frequency: 'daily'
});
```

### Advanced Filters with MongoDB Operators

```typescript
const medications = await medicationService.getWithFilters(
  { medicine: 'medicine_id_here' },
  {
    filter: {
      quantity: { $gte: 5, $lte: 20 },
      frequency: { $regex: 'daily', $options: 'i' }
    },
    pagination: {
      page: 2,
      limit: 25
    },
    sort: { createdAt: -1 }
  }
);
```

## Specialized Search Methods

### Search by Medicine

```typescript
const medications = await medicationService.getByMedicine('medicine_id_here', {
  page: 1,
  limit: 10
});
```

### Search by Quantity Range

```typescript
const medications = await medicationService.getByQuantityRange(5, 20, {
  page: 1,
  limit: 15
});
```

### Search by Frequency Pattern

```typescript
const medications = await medicationService.searchByFrequency('daily', {
  page: 1,
  limit: 20
});
```

### Search by Duration Pattern

```typescript
const medications = await medicationService.searchByDuration('ngày', {
  page: 1,
  limit: 20
});
```

## Bulk Operations

### Bulk Create

```typescript
const medicationsToCreate = [
  {
    medicine: 'medicine_id_1',
    quantity: 10,
    frequency: '1 viên x 3 lần/ngày',
    duration: '5 ngày',
    instruction: 'Sau khi ăn'
  },
  {
    medicine: 'medicine_id_2',
    quantity: 5,
    frequency: '1 viên x 2 lần/ngày',
    duration: '7 ngày',
    instruction: 'Trước khi ăn'
  }
];

const createdMedications = await medicationService.bulkCreate(medicationsToCreate);
```

### Bulk Update

```typescript
const updates = [
  {
    id: 'medication_id_1',
    data: { quantity: 15, frequency: '1 viên x 4 lần/ngày' }
  },
  {
    id: 'medication_id_2',
    data: { duration: '10 ngày' }
  }
];

const updatedMedications = await medicationService.bulkUpdate(updates);
```

### Bulk Delete

```typescript
const medicationIds = ['medication_id_1', 'medication_id_2', 'medication_id_3'];
const result = await medicationService.bulkDelete(medicationIds);
console.log(`Deleted ${result.deletedCount} medications`);
```

## Error Handling

The service methods throw errors that should be handled appropriately:

```typescript
try {
  const medication = await medicationService.getById('invalid_id');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Medication not found');
  } else if (error.response?.status === 401) {
    console.log('Authentication required');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Interfaces

### Medicine

```typescript
interface Medicine {
  _id?: string;
  name: string;
  dosage: string;
  form: string;
  route: string;
}
```

### Medication

```typescript
interface Medication {
  _id?: string;
  medicine: string | Medicine; // Can be ID or populated object
  quantity: number;
  frequency: string;
  duration: string;
  instruction?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### CreateMedicationData

```typescript
interface CreateMedicationData {
  medicine: string; // Medicine ID
  quantity: number;
  frequency: string;
  duration: string;
  instruction?: string;
}
```

### UpdateMedicationData

```typescript
interface UpdateMedicationData {
  medicine?: string;
  quantity?: number;
  frequency?: string;
  duration?: string;
  instruction?: string;
}
```

## Best Practices

1. **Always handle errors**: Wrap service calls in try-catch blocks
2. **Use pagination**: For large datasets, always specify page and limit
3. **Validate input**: Ensure required fields are provided before creating/updating
4. **Use bulk operations**: For multiple items, prefer bulk operations over individual calls
5. **Cache results**: Consider caching frequently accessed medications
6. **Type safety**: Use the provided interfaces for type safety

## Example: Complete Medication Management

```typescript
import { medicationService } from '@/services';

class MedicationManager {
  async createMedicationForPatient(medicineId: string, patientId: string) {
    try {
      const medication = await medicationService.create({
        medicine: medicineId,
        quantity: 10,
        frequency: '1 viên x 3 lần/ngày',
        duration: '7 ngày',
        instruction: 'Sau khi ăn, tránh sữa'
      });
      
      return medication;
    } catch (error) {
      console.error('Failed to create medication:', error);
      throw error;
    }
  }

  async getPatientMedications(patientId: string, page = 1, limit = 10) {
    try {
      const medications = await medicationService.getWithFilters(
        { medicine: patientId },
        { pagination: { page, limit } }
      );
      
      return medications;
    } catch (error) {
      console.error('Failed to get patient medications:', error);
      throw error;
    }
  }

  async updateMedicationDosage(medicationId: string, newQuantity: number) {
    try {
      const updated = await medicationService.update(medicationId, {
        quantity: newQuantity
      });
      
      return updated;
    } catch (error) {
      console.error('Failed to update medication:', error);
      throw error;
    }
  }
}
```

## Notes

- All endpoints require authentication via JWT token
- The medicine field is automatically populated when retrieving medications
- Pagination defaults to page 1 with 10 items per page
- Advanced filtering supports MongoDB query operators
- Bulk operations are more efficient than individual operations for multiple items

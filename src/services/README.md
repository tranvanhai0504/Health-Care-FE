# API Services Documentation

## Standardized API Response Format

All API responses follow a standardized format:

```typescript
{
  code: number;    // HTTP status code or API-specific code
  data: T;         // The actual response data, typed as generic T
  msg: string;     // A message describing the response
}
```

This structure is defined in `base.ts` as the `ApiResponse<T>` interface and is exported from the services index file.

## How to Consume API Responses

### Basic Usage

All service methods handle the standard response format internally. Most methods return just the `data` property for simplicity:

```typescript
// This returns just the user data, not the full API response
const user = await userService.getProfile();
```

### Access to Full Response

For cases where you need the status code or message, most services provide alternative methods with `WithResponse` suffix:

```typescript
// This returns the full API response with code, data, and message
const response = await userService.getProfileWithResponse();
console.log(response.code);   // Access the status code
console.log(response.msg);    // Access the message
console.log(response.data);   // Access the data
```

## Creating New Service Methods

When adding new service methods, follow these patterns:

### Method that Returns Just the Data

```typescript
async getItems(): Promise<Item[]> {
  const response = await api.get<ApiResponse<Item[]>>(this.basePath);
  return response.data.data;
}
```

### Method that Returns Full Response

```typescript
async getItemsWithResponse(): Promise<ApiResponse<Item[]>> {
  return this.getFullResponse<Item[]>(this.basePath);
}
```

### Helper Method for Custom Endpoints

The base service provides a `getFullResponse` helper method:

```typescript
protected async getFullResponse<R>(
  endpoint: string, 
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get', 
  params?: Record<string, unknown>
): Promise<ApiResponse<R>>
```

Use this method to simplify handling API responses:

```typescript
async searchItems(query: string): Promise<Item[]> {
  const response = await this.getFullResponse<Item[]>(
    `${this.basePath}/search`,
    'post',
    { query }
  );
  return response.data;
}
```

## Error Handling

All service methods handle API errors consistently. The `code` property in the response can be used to determine success or failure:

```typescript
try {
  const response = await userService.getProfileWithResponse();
  if (response.code === 200) {
    // Success
  } else {
    // Handle specific error codes
  }
} catch (error) {
  // Handle network or unexpected errors
}
```

Most methods will throw an exception if the API call fails. You can catch these exceptions and handle them appropriately. 
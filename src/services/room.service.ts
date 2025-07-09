import BaseService from './base.service';
import api from '@/lib/axios';
import { 
  Room,
  CreateRoomData,
  ApiResponse
} from '@/types';

export class RoomService extends BaseService<Room> {
  constructor() {
    super('/api/v1/room');
  }

  /**
   * Get all rooms
   * @returns Promise with array of rooms
   */
  async getAll(): Promise<Room[]> {
    const response = await api.get<ApiResponse<Room[]>>(this.basePath);
    return response.data.data;
  }

  /**
   * Get a room by ID
   * @param id - The ID of the room to get
   * @returns Promise with the room
   */
  async getById(id: string): Promise<Room> {
    const response = await api.get<ApiResponse<Room>>(`${this.basePath}/${id}`);
    return response.data.data;
  }

  /**
   * Create a new room
   * @param data - The room data to create
   * @returns Promise with the created room
   */
  async create(data: CreateRoomData): Promise<Room> {
    const response = await api.post<ApiResponse<Room>>(this.basePath, data);
    return response.data.data;
  }

  /**
   * Update an existing room
   * @param id - The ID of the room to update
   * @param data - The room data to update
   * @returns Promise with the updated room
   */
  async update(id: string, data: Partial<CreateRoomData>): Promise<Room> {
    const response = await api.put<ApiResponse<Room>>(`${this.basePath}/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete a room
   * @param id - The ID of the room to delete
   * @returns Promise with the deleted room
   */
  async delete(id: string): Promise<Room> {
    const response = await api.delete<ApiResponse<Room>>(`${this.basePath}/${id}`);
    return response.data.data;
  }
}

export const roomService = new RoomService(); 
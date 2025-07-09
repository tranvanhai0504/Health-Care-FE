/**
 * Room interface
 */
export interface Room {
  _id: string;
  name: string;
  roomNumber: number;
  roomFloor: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Create room data interface
 */
export interface CreateRoomData {
  name: string;
  roomNumber: number;
  roomFloor: number;
} 
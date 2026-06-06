import type { RoomType } from '../types';
import { DEFAULT_ROOM_TYPES } from '../data/defaultRoomTypes';

const STORAGE_KEY = 'hotel_room_types';

export function loadRoomTypes(): RoomType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROOM_TYPES;
    return JSON.parse(raw) as RoomType[];
  } catch {
    return DEFAULT_ROOM_TYPES;
  }
}

export function saveRoomTypes(roomTypes: RoomType[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roomTypes));
}

export function resetRoomTypes(): RoomType[] {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_ROOM_TYPES;
}

import type { RoomType } from '../types';
import { DEFAULT_ROOM_TYPES } from '../data/defaultRoomTypes';

const STORAGE_KEY = 'hotel_room_types';

/**
 * Загружает типы номеров из localStorage.
 * При отсутствии данных или ошибке парсинга возвращает DEFAULT_ROOM_TYPES.
 * Выполняет миграцию: заполняет отсутствующие поля значениями из DEFAULT_ROOM_TYPES,
 * а старые поля maxAdults/maxChildren конвертирует в maxExtraGuests.
 */
export function loadRoomTypes(): RoomType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROOM_TYPES;

    const loaded = JSON.parse(raw) as Partial<RoomType & { maxAdults?: number; maxChildren?: number }>[];
    return loaded.map((r) => {
      const def = DEFAULT_ROOM_TYPES.find((d) => d.id === r.id);
      // Миграция: если в localStorage остались старые поля, удаляем их
      const { maxAdults: _a, maxChildren: _c, ...rest } = r;
      return { ...def, maxExtraGuests: def?.maxExtraGuests ?? 2, ...rest } as RoomType;
    });
  } catch {
    return DEFAULT_ROOM_TYPES;
  }
}

/** Сохраняет массив типов номеров в localStorage. */
export function saveRoomTypes(roomTypes: RoomType[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roomTypes));
}

/** Удаляет сохранённые типы из localStorage и возвращает значения по умолчанию. */
export function resetRoomTypes(): RoomType[] {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_ROOM_TYPES;
}

import type { RoomType } from '../types';

/**
 * Эталонный прайс-лист, соответствующий исходной таблице Excel.
 * maxExtraGuests — суммарный лимит доп. гостей (взрослых + детей).
 * 0 = дополнительные места не предусмотрены.
 */
export const DEFAULT_ROOM_TYPES: RoomType[] = [
  { id: '1',  name: 'Standart',     priceWeekday:  8800, priceWeekend1: 13600, priceWeekend2: 19500, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 0 },
  { id: '2',  name: 'Standart+',    priceWeekday:  9900, priceWeekend1: 17700, priceWeekend2: 22000, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '3',  name: 'Luxe',         priceWeekday: 11200, priceWeekend1: 19400, priceWeekend2: 24200, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '4',  name: 'Townhouse',    priceWeekday: 18100, priceWeekend1: 31000, priceWeekend2: 43000, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '5',  name: 'Bungalow',     priceWeekday: 20200, priceWeekend1: 37100, priceWeekend2: 49000, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '6',  name: 'Chalet',       priceWeekday: 20200, priceWeekend1: 37100, priceWeekend2: 49000, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '7',  name: 'Light',        priceWeekday: 25000, priceWeekend1: 42000, priceWeekend2: 57000, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '8',  name: 'Panorama',     priceWeekday: 28100, priceWeekend1: 44500, priceWeekend2: 62500, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 4 },
  { id: '9',  name: 'Villa',        priceWeekday: 19400, priceWeekend1: 34100, priceWeekend2: 45300, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '10', name: 'Loft House',   priceWeekday: 28000, priceWeekend1: 40000, priceWeekend2: 61000, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 1 },
  { id: '11', name: 'Luxe Villa',   priceWeekday: 30500, priceWeekend1: 46000, priceWeekend2: 65500, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '12', name: 'Luxe House',   priceWeekday: 32000, priceWeekend1: 49000, priceWeekend2: 69000, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
  { id: '13', name: 'Guest Villa',  priceWeekday: 41000, priceWeekend1: 57000, priceWeekend2: 86500, adultWeekday: 2400, adultWeekend: 2800, childRate: 2100, maxExtraGuests: 2 },
];

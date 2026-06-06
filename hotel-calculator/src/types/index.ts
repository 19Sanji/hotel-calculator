export interface RoomType {
  id: string;
  name: string;
  priceWeekday: number;
  priceWeekend1: number;
  priceWeekend2: number;
  adultWeekday: number;
  adultWeekend: number;
  childRate: number;
}

export interface CalculationInput {
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  bookingDate: Date;
  isBirthday: boolean;
  manualDiscountPercent?: number;
}

export interface DiscountResult {
  name: string;
  amount: number;
}

export interface CalculationResult {
  totalNights: number;
  weekdayNights: number;
  weekendNights: number;
  friSatPairs: number;
  roomPrice: number;
  adultSurcharge: number;
  childSurcharge: number;
  totalWithoutDiscount: number;
  discount: DiscountResult;
  allDiscounts: DiscountResult[];
  totalWithDiscount: number;
}

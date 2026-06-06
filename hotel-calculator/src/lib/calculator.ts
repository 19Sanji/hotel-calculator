import { differenceInCalendarDays } from 'date-fns';
import type { RoomType, CalculationInput, CalculationResult, DiscountResult } from '../types';
import {
  countFriSatPairs,
  countWeekendNights,
  maxConsecutiveMonThu,
} from './dateUtils';

export function calculate(input: CalculationInput, roomTypes: RoomType[]): CalculationResult {
  const room = roomTypes.find((r) => r.id === input.roomTypeId);
  if (!room) throw new Error('Тип номера не найден');

  const totalNights = differenceInCalendarDays(input.checkOut, input.checkIn);
  if (totalNights <= 0) throw new Error('Дата выезда должна быть позже даты заезда');

  const weekendNights = countWeekendNights(input.checkIn, totalNights);
  const weekdayNights = totalNights - weekendNights;
  const friSatPairs = countFriSatPairs(input.checkIn, totalNights);
  const singleWeekends = weekendNights - friSatPairs * 2;

  // Base room price
  const roomPrice =
    weekdayNights * room.priceWeekday +
    friSatPairs * room.priceWeekend2 +
    singleWeekends * room.priceWeekend1;

  // Adult surcharge: matches Excel B10 = D3*(weekdays*adultWeekday + weekendNights*adultWeekend)
  // input.adults = additional adults (D3 in Excel), multiplied directly without offset
  const extraAdults = input.adults;
  const adultSurcharge =
    extraAdults > 0
      ? extraAdults * (weekdayNights * room.adultWeekday + weekendNights * room.adultWeekend)
      : 0;

  // Child surcharge: flat rate per night for every child
  const childSurcharge = input.children * room.childRate * totalNights;

  const totalWithoutDiscount = roomPrice + adultSurcharge + childSurcharge;

  // --- Discounts ---
  const discounts: DiscountResult[] = [];

  // Early booking: Excel Z3 = IF(C3-F3>=30, ...) → checkout - bookingDate >= 30
  const daysCheckOutToBooking = differenceInCalendarDays(input.checkOut, input.bookingDate);
  if (daysCheckOutToBooking >= 30 && totalNights > 0) {
    discounts.push({ name: 'Раннее бронирование', amount: Math.round(totalWithoutDiscount * 0.1) });
  }

  // Birthday: 15%
  if (input.isBirthday) {
    discounts.push({ name: 'Именинник', amount: Math.round(totalWithoutDiscount * 0.15) });
  }

  // 3+1 / 4+1: one free weekday night (Mon–Thu consecutive, matching Excel AF3).
  // Both are added when eligible; priority order picks 3+1 over 4+1 when amounts are equal
  // (matches Excel H3 IF-chain which checks AB3="3+1" before AC3="4+1").
  const consecutiveMonThu = maxConsecutiveMonThu(input.checkIn, totalNights);
  const freeNightDiscount =
    room.priceWeekday +
    extraAdults * room.adultWeekday +
    input.children * room.childRate;

  // 3+1: "pay 3, get 4th free" → need ≥4 total nights AND ≥3 consecutive Mon-Thu
  if (consecutiveMonThu >= 3 && totalNights >= 4) {
    discounts.push({ name: '3+1', amount: freeNightDiscount });
  }
  // 4+1: "pay 4, get 5th free" → need ≥5 total nights AND ≥4 consecutive Mon-Thu
  if (consecutiveMonThu >= 4 && totalNights >= 5) {
    discounts.push({ name: '4+1', amount: freeNightDiscount });
  }

  // Long stay: ≥7 nights → recalculate all nights at weekday rate
  if (totalNights >= 7) {
    const longStayTotal =
      totalNights * room.priceWeekday +
      extraAdults * totalNights * room.adultWeekday +
      input.children * totalNights * room.childRate;
    const longStayDiscount = totalWithoutDiscount - longStayTotal;
    if (longStayDiscount > 0) {
      discounts.push({ name: 'Длительный заезд', amount: longStayDiscount });
    }
  }

  // Pick best discount: max amount; ties broken by Excel H3 IF-chain order
  const PRIORITY = ['Раннее бронирование', 'Именинник', '3+1', '4+1', 'Длительный заезд'];
  const noDiscount: DiscountResult = { name: 'Нет акции', amount: 0 };

  let bestDiscount = noDiscount;
  for (const d of discounts) {
    if (d.amount > bestDiscount.amount) {
      bestDiscount = d;
    } else if (d.amount === bestDiscount.amount && bestDiscount.amount > 0) {
      const currentPriority = PRIORITY.indexOf(d.name);
      const bestPriority = PRIORITY.indexOf(bestDiscount.name);
      if (currentPriority < bestPriority) {
        bestDiscount = d;
      }
    }
  }

  return {
    totalNights,
    weekdayNights,
    weekendNights,
    friSatPairs,
    roomPrice,
    adultSurcharge,
    childSurcharge,
    totalWithoutDiscount,
    discount: bestDiscount,
    totalWithDiscount: totalWithoutDiscount - bestDiscount.amount,
  };
}

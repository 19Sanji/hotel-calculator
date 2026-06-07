import { differenceInCalendarDays } from 'date-fns';
import type { RoomType, CalculationInput, CalculationResult, DiscountResult } from '../types';
import {
  countFriSatPairs,
  countWeekendNights,
  maxConsecutiveMonThu,
} from './dateUtils';

/**
 * Рассчитывает полную стоимость проживания с учётом тарифной сетки,
 * надбавок за гостей и всех применимых скидок.
 *
 * Возвращает CalculationResult, где:
 * - allDiscounts[0] всегда «Нет акции» (нулевая скидка);
 * - discount — автоматически выбранная лучшая скидка;
 * - selectedDiscountIdx на стороне UI указывает на выбор пользователя.
 *
 * @throws {Error} Если тип номера не найден или даты некорректны.
 */
export function calculate(input: CalculationInput, roomTypes: RoomType[]): CalculationResult {
  const room = roomTypes.find((r) => r.id === input.roomTypeId);
  if (!room) throw new Error('Тип номера не найден');

  const totalNights = differenceInCalendarDays(input.checkOut, input.checkIn);
  if (totalNights <= 0) throw new Error('Дата выезда должна быть позже даты заезда');

  const weekendNights = countWeekendNights(input.checkIn, totalNights);
  const weekdayNights = totalNights - weekendNights;
  const friSatPairs = countFriSatPairs(input.checkIn, totalNights);
  // Выходные ночи, не входящие в пару пт+сб
  const singleWeekends = weekendNights - friSatPairs * 2;

  // Базовая стоимость номера по тарифной сетке
  const roomPrice =
    weekdayNights * room.priceWeekday +
    friSatPairs * room.priceWeekend2 +
    singleWeekends * room.priceWeekend1;

  // Надбавка за доп. взрослых: количество × (будни × тариф + выходные × тариф)
  // Воспроизводит Excel B10 = D3*(weekdays*adultWeekday + weekendNights*adultWeekend)
  const extraAdults = input.adults;
  const adultSurcharge =
    extraAdults > 0
      ? extraAdults * (weekdayNights * room.adultWeekday + weekendNights * room.adultWeekend)
      : 0;

  // Надбавка за детей: фиксированный тариф × количество детей × количество ночей
  const childSurcharge = input.children * room.childRate * totalNights;

  const totalWithoutDiscount = roomPrice + adultSurcharge + childSurcharge;

  // --- Расчёт скидок ---
  const discounts: DiscountResult[] = [];

  // Раннее бронирование: дата выезда − дата бронирования ≥ 30 дней
  // Воспроизводит Excel Z3 = IF(C3-F3>=30, …)
  const daysCheckOutToBooking = differenceInCalendarDays(input.checkOut, input.bookingDate);
  if (daysCheckOutToBooking >= 30 && totalNights > 0) {
    discounts.push({
      name: 'Раннее бронирование',
      amount: Math.round(totalWithoutDiscount * 0.1),
    });
  }

  // Именинник: скидка 15%
  if (input.isBirthday) {
    discounts.push({
      name: 'Именинник',
      amount: Math.round(totalWithoutDiscount * 0.15),
    });
  }

  // Акции 3+1 / 4+1: одна бесплатная ночь пн–чт при наличии нужного количества
  // непрерывных будних ночей. Скидка равна стоимости одной ночи с доплатами.
  // Приоритет: 3+1 выбирается раньше 4+1 при равных суммах (согласно Excel H3).
  const consecutiveMonThu = maxConsecutiveMonThu(input.checkIn, totalNights);
  const freeNightDiscount =
    room.priceWeekday +
    extraAdults * room.adultWeekday +
    input.children * room.childRate;

  // 3+1: «плати за 3, получи 4-ю бесплатно» — нужно ≥4 ночей и ≥3 будних подряд
  if (consecutiveMonThu >= 3 && totalNights >= 4) {
    discounts.push({ name: '3+1', amount: freeNightDiscount });
  }
  // 4+1: «плати за 4, получи 5-ю бесплатно» — нужно ≥5 ночей и ≥4 будних подряд
  if (consecutiveMonThu >= 4 && totalNights >= 5) {
    discounts.push({ name: '4+1', amount: freeNightDiscount });
  }

  // Длительный заезд (≥7 ночей): все ночи пересчитываются по будничному тарифу
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

  // Ручная скидка в процентах
  if (input.manualDiscountPercent && input.manualDiscountPercent > 0) {
    discounts.push({
      name: `Ручная скидка ${input.manualDiscountPercent}%`,
      amount: Math.round((totalWithoutDiscount * input.manualDiscountPercent) / 100),
    });
  }

  // Выбор лучшей скидки: максимальная сумма; при равенстве — по приоритету Excel H3
  const PRIORITY = ['Раннее бронирование', 'Именинник', '3+1', '4+1', 'Длительный заезд'];
  const noDiscount: DiscountResult = { name: 'Нет акции', amount: 0 };

  let bestDiscount = noDiscount;
  for (const d of discounts) {
    if (d.amount > bestDiscount.amount) {
      bestDiscount = d;
    } else if (d.amount === bestDiscount.amount && bestDiscount.amount > 0) {
      const currentPriority = PRIORITY.indexOf(d.name);
      const bestPriority = PRIORITY.indexOf(bestDiscount.name);
      if (currentPriority < bestPriority) bestDiscount = d;
    }
  }

  // allDiscounts: «Нет акции» всегда на индексе 0, далее все применимые скидки
  const allDiscounts = [noDiscount, ...discounts];

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
    allDiscounts,
    totalWithDiscount: totalWithoutDiscount - bestDiscount.amount,
  };
}

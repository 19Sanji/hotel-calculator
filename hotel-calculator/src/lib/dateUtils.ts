import { getDay, addDays } from 'date-fns';

/** Пятница = 5, суббота = 6 по нумерации getDay (0=вс, 1=пн, …). */
const FRI = 5;
const SAT = 6;

/**
 * Возвращает true, если ночь, начинающаяся в указанную дату, является выходной
 * (пятница или суббота).
 */
export function isWeekendNight(date: Date): boolean {
  const day = getDay(date);
  return day === FRI || day === SAT;
}

/**
 * Подсчитывает количество пар пятница+суббота в периоде проживания.
 * Сканирует ночи по одной: если ночь i начинается в пятницу и ночь i+1 — в субботу,
 * фиксируется пара и счётчик прыгает на +2.
 */
export function countFriSatPairs(checkIn: Date, nights: number): number {
  let pairs = 0;
  let i = 0;
  while (i < nights) {
    const day = getDay(addDays(checkIn, i));
    if (day === FRI && i + 1 < nights) {
      const nextDay = getDay(addDays(checkIn, i + 1));
      if (nextDay === SAT) {
        pairs++;
        i += 2;
        continue;
      }
    }
    i++;
  }
  return pairs;
}

/**
 * Возвращает максимальную длину непрерывной серии ночей пн–чт в периоде проживания.
 * Воспроизводит логику Excel AF3: WEEKDAY(date,2)<=4.
 * Воскресенье, пятница и суббота являются разрывами серии.
 * Используется для определения права на акции 3+1 и 4+1.
 */
export function maxConsecutiveMonThu(checkIn: Date, nights: number): number {
  let max = 0;
  let current = 0;
  for (let i = 0; i < nights; i++) {
    const day = getDay(addDays(checkIn, i)); // 0=вс, 1=пн, …, 4=чт, 5=пт, 6=сб
    if (day >= 1 && day <= 4) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

/**
 * Подсчитывает количество выходных ночей (пт или сб) в периоде проживания.
 */
export function countWeekendNights(checkIn: Date, nights: number): number {
  let count = 0;
  for (let i = 0; i < nights; i++) {
    if (isWeekendNight(addDays(checkIn, i))) count++;
  }
  return count;
}

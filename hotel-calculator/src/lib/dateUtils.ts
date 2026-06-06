import { getDay, addDays } from 'date-fns';

// Friday = 5, Saturday = 6
export function isWeekendNight(date: Date): boolean {
  const day = getDay(date);
  return day === 5 || day === 6;
}

// Count consecutive Friday+Saturday pairs in the stay period.
// Scans night-by-night: if night i starts on Friday and night i+1 starts on Saturday → pair.
export function countFriSatPairs(checkIn: Date, nights: number): number {
  let pairs = 0;
  let i = 0;
  while (i < nights) {
    const day = getDay(addDays(checkIn, i));
    if (day === 5 && i + 1 < nights) {
      // next night must start on Saturday
      const nextDay = getDay(addDays(checkIn, i + 1));
      if (nextDay === 6) {
        pairs++;
        i += 2;
        continue;
      }
    }
    i++;
  }
  return pairs;
}

// Maximum consecutive Mon–Thu nights, matching Excel AF3: WEEKDAY(date,2)<=4.
// Sunday (getDay=0) acts as a separator, just like Fri/Sat.
// Used only for 3+1 / 4+1 eligibility.
export function maxConsecutiveMonThu(checkIn: Date, nights: number): number {
  let max = 0;
  let current = 0;
  for (let i = 0; i < nights; i++) {
    const day = getDay(addDays(checkIn, i)); // 0=Sun,1=Mon,...,4=Thu,5=Fri,6=Sat
    if (day >= 1 && day <= 4) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

export function countWeekendNights(checkIn: Date, nights: number): number {
  let count = 0;
  for (let i = 0; i < nights; i++) {
    if (isWeekendNight(addDays(checkIn, i))) count++;
  }
  return count;
}

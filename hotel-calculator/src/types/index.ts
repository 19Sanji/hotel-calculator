/** Тип номера со всеми тарифами и ограничением по дополнительным местам. */
export interface RoomType {
  id: string;
  name: string;
  /** Цена за ночь в будни (пн–чт). */
  priceWeekday: number;
  /** Цена за выходную ночь отдельно (без пары пт+сб). */
  priceWeekend1: number;
  /** Цена за пару пятница+суббота (за две ночи). */
  priceWeekend2: number;
  /** Доплата за одного доп. взрослого в будни. */
  adultWeekday: number;
  /** Доплата за одного доп. взрослого в выходные. */
  adultWeekend: number;
  /** Доплата за одного доп. ребёнка за ночь. */
  childRate: number;
  /**
   * Максимальное суммарное количество доп. гостей (взрослых + детей).
   * 0 — дополнительные места не предусмотрены.
   */
  maxExtraGuests: number;
}

/** Входные параметры для расчёта стоимости проживания. */
export interface CalculationInput {
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  /** Количество дополнительных взрослых. */
  adults: number;
  /** Количество дополнительных детей. */
  children: number;
  /** Дата бронирования (используется для скидки «Раннее бронирование»). */
  bookingDate: Date;
  isBirthday: boolean;
  manualDiscountPercent?: number;
}

/** Результат расчёта одной скидки. */
export interface DiscountResult {
  name: string;
  /** Абсолютная сумма скидки в рублях. */
  amount: number;
}

/** Полный результат расчёта стоимости проживания. */
export interface CalculationResult {
  totalNights: number;
  weekdayNights: number;
  weekendNights: number;
  /** Количество пар пт+сб. */
  friSatPairs: number;
  roomPrice: number;
  adultSurcharge: number;
  childSurcharge: number;
  totalWithoutDiscount: number;
  /** Автоматически выбранная лучшая скидка. */
  discount: DiscountResult;
  /** Все доступные скидки, включая «Нет акции» на индексе 0. */
  allDiscounts: DiscountResult[];
  totalWithDiscount: number;
}

/** Состояние одного расчёта внутри заказа. */
export interface CalculationPanel {
  id: string;
  input: CalculationInput | null;
  result: CalculationResult | null;
  /** Индекс выбранной скидки в массиве allDiscounts. */
  selectedDiscountIdx: number;
}

/** Заказ — группа расчётов с опциональным сохранённым именем. */
export interface Order {
  id: string;
  panels: CalculationPanel[];
  /** Имя задаётся при сохранении в реестр. */
  savedName?: string;
}

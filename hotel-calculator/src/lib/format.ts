import type { CalculationPanel } from '../types';

/**
 * Форматирует число как сумму в рублях без копеек.
 * Пример: 15000 → «15 000 ₽»
 */
export const fmt = (n: number): string =>
  n.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

/**
 * Вычисляет итоговую стоимость расчёта с учётом выбранной пользователем скидки.
 * Если результата нет, возвращает 0.
 */
export const getPanelTotal = (panel: CalculationPanel): number => {
  if (!panel.result) return 0;
  const discount =
    panel.result.allDiscounts[panel.selectedDiscountIdx] ?? panel.result.allDiscounts[0];
  return panel.result.totalWithoutDiscount - (discount?.amount ?? 0);
};

import React from 'react';
import { Descriptions, Radio, Divider, Tag } from 'antd';
import type { CalculationResult } from '../types';
import { fmt } from '../lib/format';

interface Props {
  result: CalculationResult;
  /** Индекс выбранной скидки в allDiscounts. */
  selectedDiscountIdx: number;
  /** Если не передан — режим просмотра (без радио-кнопок). */
  onDiscountChange?: (idx: number) => void;
  /** В режиме readonly скидка отображается тегом, а не Radio.Group. */
  readonly?: boolean;
}

/**
 * Отображает детализированный результат расчёта:
 * разбивку по ночам, стоимость номера и надбавок, блок выбора скидки и итог.
 * В readonly-режиме используется в реестре заказов (без возможности смены скидки).
 */
export const ResultDisplay: React.FC<Props> = ({
  result,
  selectedDiscountIdx,
  onDiscountChange,
  readonly = false,
}) => {
  const selectedDiscount = result.allDiscounts[selectedDiscountIdx] ?? result.allDiscounts[0];
  const finalTotal = result.totalWithoutDiscount - (selectedDiscount?.amount ?? 0);
  const hasDiscount = (selectedDiscount?.amount ?? 0) > 0;

  // Индекс скидки с максимальной суммой (для бейджика «рекомендуется»)
  const bestIdx = result.allDiscounts.reduce(
    (best, d, i) => (d.amount > (result.allDiscounts[best]?.amount ?? 0) ? i : best),
    0
  );
  const noDiscountsAvailable =
    result.allDiscounts.length === 1 && result.allDiscounts[0].amount === 0;

  return (
    <div style={{ marginTop: 8 }}>
      {/* Разбивка по ночам */}
      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Ночей всего">
          <strong>{result.totalNights}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Будничных">{result.weekdayNights}</Descriptions.Item>
        <Descriptions.Item label="Выходных">{result.weekendNights}</Descriptions.Item>
        <Descriptions.Item label="Пар пт+сб">{result.friSatPairs}</Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '10px 0' }} />

      {/* Разбивка по стоимости */}
      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Стоимость номера">{fmt(result.roomPrice)}</Descriptions.Item>
        <Descriptions.Item label="Доплата взрослые">{fmt(result.adultSurcharge)}</Descriptions.Item>
        <Descriptions.Item label="Доплата дети">{fmt(result.childSurcharge)}</Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '10px 0' }} />

      {/* Блок выбора скидки */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Скидка:</div>

        {noDiscountsAvailable ? (
          <Tag color="default">Нет доступных акций</Tag>
        ) : readonly ? (
          <Tag color={hasDiscount ? 'green' : 'default'}>
            {selectedDiscount?.name ?? 'Нет акции'}
            {hasDiscount && ` (−${fmt(selectedDiscount!.amount)})`}
          </Tag>
        ) : (
          <Radio.Group
            value={selectedDiscountIdx}
            onChange={(e) => onDiscountChange?.(e.target.value)}
          >
            {result.allDiscounts.map((d, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <Radio value={idx}>
                  {d.name}
                  {d.amount > 0 && (
                    <span style={{ color: '#cf1322', marginLeft: 12 }}>−{fmt(d.amount)}</span>
                  )}
                </Radio>
                {idx === bestIdx && result.allDiscounts[bestIdx].amount > 0 && (
                  <Tag color="success" style={{ marginLeft: 6, fontSize: 11 }}>
                    ✓ рекомендуется
                  </Tag>
                )}
              </div>
            ))}
          </Radio.Group>
        )}
      </div>

      {/* Итоговый блок */}
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Итого без скидки">
          {fmt(result.totalWithoutDiscount)}
        </Descriptions.Item>
        {hasDiscount && (
          <Descriptions.Item label={`Скидка (${selectedDiscount!.name})`}>
            <span style={{ color: '#cf1322' }}>−{fmt(selectedDiscount!.amount)}</span>
          </Descriptions.Item>
        )}
        <Descriptions.Item label={<strong style={{ fontSize: 15 }}>ИТОГО</strong>}>
          <strong style={{ fontSize: 20, color: '#389e0d' }}>{fmt(finalTotal)}</strong>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

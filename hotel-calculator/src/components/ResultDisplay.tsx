import React from 'react';
import { Descriptions, Tag, Typography, Divider } from 'antd';
import type { CalculationResult } from '../types';

const { Title } = Typography;

interface Props {
  result: CalculationResult;
}

const fmt = (n: number) =>
  n.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

export const ResultDisplay: React.FC<Props> = ({ result }) => {
  const hasDiscount = result.discount.amount > 0;

  return (
    <div style={{ marginTop: 24 }}>
      <Divider />
      <Title level={4}>Результат расчёта</Title>

      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Ночей всего">
          <strong>{result.totalNights}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Будничных ночей">
          {result.weekdayNights}
        </Descriptions.Item>
        <Descriptions.Item label="Выходных ночей">
          {result.weekendNights}
        </Descriptions.Item>
        <Descriptions.Item label="Пар «пт + сб»">
          {result.friSatPairs}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
        <Descriptions.Item label="Цена номера (до скидки)">
          {fmt(result.roomPrice)}
        </Descriptions.Item>
        <Descriptions.Item label="Доплата за взрослых">
          {fmt(result.adultSurcharge)}
        </Descriptions.Item>
        <Descriptions.Item label="Доплата за детей">
          {fmt(result.childSurcharge)}
        </Descriptions.Item>
        <Descriptions.Item label={<strong>Итого без скидки</strong>}>
          <strong style={{ fontSize: 16 }}>{fmt(result.totalWithoutDiscount)}</strong>
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Акция">
          {hasDiscount ? (
            <Tag color="green" style={{ fontSize: 14 }}>
              {result.discount.name}
            </Tag>
          ) : (
            <Tag color="default">Нет акции</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Скидка">
          {hasDiscount ? (
            <span style={{ color: '#cf1322', fontWeight: 600 }}>
              − {fmt(result.discount.amount)}
            </span>
          ) : (
            '0 ₽'
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <strong style={{ fontSize: 16 }}>ИТОГО со скидкой</strong>
          }
        >
          <strong style={{ fontSize: 20, color: '#389e0d' }}>
            {fmt(result.totalWithDiscount)}
          </strong>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

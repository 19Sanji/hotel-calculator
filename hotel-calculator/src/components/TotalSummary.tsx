import React from 'react';
import { Card, Divider } from 'antd';
import type { CalculationPanel } from '../types';
import { fmt, getPanelTotal } from '../lib/format';

interface Props {
  panels: CalculationPanel[];
  /** Заголовки панелей в том же порядке, что и panels. */
  titles: string[];
}

/**
 * Сводный блок «Итого по заказу».
 * Отображается только если в заказе есть как минимум два завершённых расчёта.
 * Показывает сумму по каждому расчёту и общий итог.
 */
export const TotalSummary: React.FC<Props> = ({ panels, titles }) => {
  const done = panels.filter((p) => p.result !== null);
  if (done.length < 2) return null;

  const total = done.reduce((sum, p) => sum + getPanelTotal(p), 0);

  return (
    <Card
      style={{ marginTop: 8, background: '#f6ffed', borderColor: '#b7eb8f' }}
      styles={{ body: { padding: '12px 20px' } }}
    >
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Итого по заказу</div>
      {done.map((p) => {
        const idx = panels.indexOf(p);
        return (
          <div
            key={p.id}
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
          >
            <span style={{ color: '#555' }}>{titles[idx] ?? `Расчёт #${idx + 1}`}</span>
            <span>{fmt(getPanelTotal(p))}</span>
          </div>
        );
      })}
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong style={{ fontSize: 17 }}>ИТОГО</strong>
        <strong style={{ fontSize: 17, color: '#389e0d' }}>{fmt(total)}</strong>
      </div>
    </Card>
  );
};

import React, { useState } from 'react';
import { Card, Button, Space, Collapse, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CalculationPanel as CalculationPanelType, CalculationInput, RoomType } from '../types';
import { CalculatorForm } from './CalculatorForm';
import { ResultDisplay } from './ResultDisplay';
import { fmt, getPanelTotal } from '../lib/format';

const { Text } = Typography;

interface Props {
  panel: CalculationPanelType;
  /** Заголовок, вычисленный в OrderPanel (имя типа номера + порядковый номер). */
  title: string;
  roomTypes: RoomType[];
  onCalculate: (input: CalculationInput) => void;
  onDiscount: (idx: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  /** Показывать кнопку удаления только если в заказе больше одной панели. */
  canRemove: boolean;
}

/**
 * Карточка одного расчёта внутри заказа.
 * Содержит два сворачиваемых блока: форму параметров и результат.
 * После успешного расчёта форма сворачивается, результат разворачивается.
 * Когда результат свёрнут, в заголовке отображается итоговая сумма.
 */
export const CalculationPanel: React.FC<Props> = ({
  panel,
  title,
  roomTypes,
  onCalculate,
  onDiscount,
  onDuplicate,
  onRemove,
  canRemove,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [resultCollapsed, setResultCollapsed] = useState(false);

  /** Выполняет расчёт, сворачивает форму и разворачивает результат. */
  const handleCalculate = (input: CalculationInput) => {
    setError(null);
    onCalculate(input);
    setFormCollapsed(true);
    setResultCollapsed(false);
  };

  // Показываем итог в заголовке только когда результат свёрнут
  const showTotal = resultCollapsed && panel.result !== null;

  const extraButtons = (
    <Space size="small" onClick={(e) => e.stopPropagation()}>
      {showTotal && (
        <strong style={{ color: '#389e0d', fontSize: 14 }}>
          {fmt(getPanelTotal(panel))}
        </strong>
      )}
      <Button size="small" icon={<CopyOutlined />} onClick={onDuplicate} title="Дублировать" />
      {canRemove && (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={onRemove} title="Удалить" />
      )}
    </Space>
  );

  return (
    <Card
      title={<strong>{title}</strong>}
      extra={extraButtons}
      style={{ marginBottom: 12 }}
      styles={{ body: { paddingTop: 8, paddingBottom: 8 } }}
    >
      <Collapse
        activeKey={formCollapsed ? [] : ['form']}
        onChange={(keys) => setFormCollapsed(!keys.includes('form'))}
        ghost
        items={[{
          key: 'form',
          label: (
            <Text
              type={formCollapsed && panel.result ? 'secondary' : undefined}
              style={{ fontSize: 13 }}
            >
              Параметры расчёта
            </Text>
          ),
          children: (
            // key={panel.id} перемонтирует форму при смене панели,
            // заполняя её из initialValues без useEffect
            <CalculatorForm
              key={panel.id}
              roomTypes={roomTypes}
              onCalculate={handleCalculate}
              error={error}
              initialValues={panel.input ?? undefined}
            />
          ),
        }]}
      />

      {panel.result && (
        <Collapse
          activeKey={resultCollapsed ? [] : ['result']}
          onChange={(keys) => setResultCollapsed(!keys.includes('result'))}
          ghost
          items={[{
            key: 'result',
            label: <Text style={{ fontSize: 13 }}>Результат расчёта</Text>,
            children: (
              <ResultDisplay
                result={panel.result}
                selectedDiscountIdx={panel.selectedDiscountIdx}
                onDiscountChange={onDiscount}
              />
            ),
          }]}
        />
      )}
    </Card>
  );
};

import React, { useState } from 'react';
import { Card, Button, Modal, Input } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import type { Order, CalculationPanel, CalculationInput, RoomType } from '../types';
import { CalculationPanel as CalculationPanelComponent } from './CalculationPanel';
import { TotalSummary } from './TotalSummary';

interface Props {
  order: Order;
  roomTypes: RoomType[];
  onAddPanel: () => void;
  onCalculate: (panelId: string, input: CalculationInput) => void;
  onDiscount: (panelId: string, idx: number) => void;
  onDuplicate: (panelId: string) => void;
  onRemovePanel: (panelId: string) => void;
  onSave: (name: string) => void;
}

/**
 * Вычисляет заголовки для панелей расчёта на основе типа номера.
 * Если в заказе несколько панелей с одним типом номера,
 * добавляет порядковый номер (например, «Standart 2»).
 */
export function getPanelTitles(panels: CalculationPanel[], roomTypes: RoomType[]): string[] {
  return panels.map((panel) => {
    const roomType = roomTypes.find((r) => r.id === panel.input?.roomTypeId);
    if (!roomType) return 'Новый расчёт';

    const sameType = panels.filter((p) => p.input?.roomTypeId === panel.input?.roomTypeId);
    if (sameType.length === 1) return roomType.name;

    return `${roomType.name} ${sameType.indexOf(panel) + 1}`;
  });
}

/**
 * Карточка текущего заказа.
 * Отображает список панелей расчёта, итоговую сводку и кнопку сохранения в реестр.
 */
export const OrderPanel: React.FC<Props> = ({
  order,
  roomTypes,
  onAddPanel,
  onCalculate,
  onDiscount,
  onDuplicate,
  onRemovePanel,
  onSave,
}) => {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const panelTitles = getPanelTitles(order.panels, roomTypes);

  /** Открывает модальное окно сохранения, предзаполняя текущее имя (если есть). */
  const handleOpenSave = () => {
    setSaveName(order.savedName ?? '');
    setSaveModalOpen(true);
  };

  /** Передаёт имя наверх и закрывает модальное окно. */
  const handleSaveConfirm = () => {
    if (saveName.trim()) {
      onSave(saveName.trim());
      setSaveModalOpen(false);
    }
  };

  const orderTitle = order.savedName ?? 'Текущий заказ';

  const extra = (
    <span onClick={(e) => e.stopPropagation()}>
      <Button type="primary" icon={<SaveOutlined />} onClick={handleOpenSave}>
        Сохранить заказ
      </Button>
    </span>
  );

  return (
    <Card
      title={<strong>{orderTitle}</strong>}
      extra={extra}
      style={{ marginBottom: 12, borderColor: '#d9d9d9' }}
      styles={{ body: { background: '#fafafa', padding: '12px 16px' } }}
    >
      {order.panels.map((panel, i) => (
        <CalculationPanelComponent
          key={panel.id}
          panel={panel}
          title={panelTitles[i]}
          roomTypes={roomTypes}
          onCalculate={(input) => onCalculate(panel.id, input)}
          onDiscount={(idx) => onDiscount(panel.id, idx)}
          onDuplicate={() => onDuplicate(panel.id)}
          onRemove={() => onRemovePanel(panel.id)}
          canRemove={order.panels.length > 1}
        />
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onAddPanel}
        style={{ width: '100%', marginBottom: 12 }}
      >
        Расчет
      </Button>

      <TotalSummary panels={order.panels} titles={panelTitles} />

      <Modal
        title="Сохранить заказ в реестр"
        open={saveModalOpen}
        onOk={handleSaveConfirm}
        onCancel={() => setSaveModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
        okButtonProps={{ disabled: !saveName.trim() }}
      >
        <Input
          placeholder="Название заказа"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onPressEnter={handleSaveConfirm}
          autoFocus
        />
      </Modal>
    </Card>
  );
};

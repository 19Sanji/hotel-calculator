import React from 'react';
import { Table, Button, Popconfirm, Empty, Tag, Typography, type TableColumnsType } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Order, CalculationPanel, RoomType } from '../types';
import { ResultDisplay } from './ResultDisplay';
import { fmt, getPanelTotal } from '../lib/format';

const { Text } = Typography;

interface Props {
  savedOrders: Order[];
  roomTypes: RoomType[];
  /** Создать новый заказ и открыть калькулятор. */
  onNew: () => void;
  /** Загрузить заказ из реестра в калькулятор для редактирования. */
  onEdit: (id: string) => void;
  /** Удалить заказ из реестра. */
  onDelete: (id: string) => void;
}

/** Форматирует дату в строку «дд.мм.гггг». */
const fmtDate = (d: Date) => format(new Date(d), 'dd.MM.yyyy', { locale: ru });

/** Суммирует итоговую стоимость по всем панелям заказа. */
const orderTotal = (order: Order): number =>
  order.panels.reduce((sum, p) => sum + getPanelTotal(p), 0);

/**
 * Реестр сохранённых заказов.
 * Каждый заказ можно раскрыть для просмотра списка расчётов,
 * а каждый расчёт — для полного результата.
 * Данные живут только в памяти сессии (не сохраняются между перезагрузками).
 */
export const CalculationsRegistry: React.FC<Props> = ({
  savedOrders,
  roomTypes,
  onNew,
  onEdit,
  onDelete,
}) => {
  const toolbar = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <strong style={{ fontSize: 15 }}>Реестр заказов</strong>
      <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
        Новый заказ
      </Button>
    </div>
  );

  if (savedOrders.length === 0) {
    return (
      <>
        {toolbar}
        <Empty
          description="Нет сохранённых заказов. Создайте новый заказ и сохраните его."
          style={{ padding: '40px 0' }}
        />
      </>
    );
  }

  const columns: TableColumnsType<Order> = [
    {
      title: 'Название',
      dataIndex: 'savedName',
      key: 'savedName',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Расчётов',
      key: 'count',
      render: (_, o) => o.panels.filter((p) => p.result).length,
    },
    {
      title: 'Итого',
      key: 'total',
      render: (_, o) => (
        <strong style={{ color: '#389e0d' }}>{fmt(orderTotal(o))}</strong>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 80,
      render: (_, o) => (
        <span style={{ display: 'flex', gap: 6 }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(o.id)}
            title="Редактировать"
          />
          <Popconfirm
            title="Удалить заказ?"
            onConfirm={() => onDelete(o.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button size="small" danger icon={<DeleteOutlined />} title="Удалить" />
          </Popconfirm>
        </span>
      ),
    },
  ];

  /** Разворачиваемая строка: таблица расчётов внутри заказа. */
  const expandedRow = (order: Order) => {
    const done = order.panels.filter((p) => p.result);
    if (!done.length) return <Text type="secondary">Нет завершённых расчётов</Text>;

    const panelColumns: TableColumnsType<CalculationPanel> = [
      {
        title: 'Тип номера',
        key: 'room',
        render: (_, p) => roomTypes.find((r) => r.id === p.input?.roomTypeId)?.name ?? '—',
      },
      {
        title: 'Заезд',
        key: 'checkIn',
        render: (_, p) => (p.input ? fmtDate(p.input.checkIn) : '—'),
      },
      {
        title: 'Выезд',
        key: 'checkOut',
        render: (_, p) => (p.input ? fmtDate(p.input.checkOut) : '—'),
      },
      {
        title: 'Ночей',
        key: 'nights',
        render: (_, p) => p.result?.totalNights ?? '—',
      },
      {
        title: 'Скидка',
        key: 'discount',
        render: (_, p) => {
          if (!p.result) return '—';
          const d = p.result.allDiscounts[p.selectedDiscountIdx] ?? p.result.allDiscounts[0];
          return d.amount > 0
            ? <Tag color="green">{d.name}</Tag>
            : <Tag color="default">Нет</Tag>;
        },
      },
      {
        title: 'Итого',
        key: 'total',
        render: (_, p) => (p.result ? <strong>{fmt(getPanelTotal(p))}</strong> : '—'),
      },
    ];

    return (
      <Table
        dataSource={done}
        columns={panelColumns}
        rowKey="id"
        pagination={false}
        size="small"
        expandable={{
          expandedRowRender: (p) =>
            p.result ? (
              <ResultDisplay
                result={p.result}
                selectedDiscountIdx={p.selectedDiscountIdx}
                readonly
              />
            ) : null,
          rowExpandable: (p) => p.result !== null,
        }}
        style={{ margin: '8px 0' }}
      />
    );
  };

  return (
    <>
      {toolbar}
      <Table
        dataSource={savedOrders}
        columns={columns}
        rowKey="id"
        expandable={{ expandedRowRender: expandedRow }}
        pagination={false}
      />
    </>
  );
};

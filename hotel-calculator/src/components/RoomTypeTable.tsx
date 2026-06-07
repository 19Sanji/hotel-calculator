import React, { useState } from 'react';
import { Table, InputNumber, Input, Button, Space, Popconfirm, Typography, message, type TableColumnsType } from 'antd';
import type { RoomType } from '../types';
import { DEFAULT_ROOM_TYPES } from '../data/defaultRoomTypes';
import { saveRoomTypes } from '../lib/storage';

const { Title } = Typography;

interface Props {
  roomTypes: RoomType[];
  onChange: (roomTypes: RoomType[]) => void;
}

/** Поля RoomType, доступные для редактирования (без id). */
type EditableField = keyof Omit<RoomType, 'id'>;

/**
 * Таблица тарифов и ограничений по типам номеров.
 * Поддерживает inline-редактирование каждой строки и сброс к значениям по умолчанию.
 */
export const RoomTypeTable: React.FC<Props> = ({ roomTypes, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<RoomType>>({});

  /** Переводит строку в режим редактирования, копируя текущие значения. */
  const startEdit = (record: RoomType) => {
    setEditingId(record.id);
    setEditRow({ ...record });
  };

  /** Отменяет редактирование без сохранения. */
  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({});
  };

  /** Сохраняет отредактированную строку в state и localStorage. */
  const saveEdit = (id: string) => {
    const updated = roomTypes.map((r) => (r.id === id ? { ...r, ...editRow } : r));
    onChange(updated);
    saveRoomTypes(updated);
    setEditingId(null);
    setEditRow({});
    message.success('Сохранено');
  };

  /** Сбрасывает все тарифы к исходным значениям из DEFAULT_ROOM_TYPES. */
  const handleReset = () => {
    onChange(DEFAULT_ROOM_TYPES);
    saveRoomTypes(DEFAULT_ROOM_TYPES);
    message.success('Справочник сброшен к исходным значениям');
  };

  /**
   * Рендерит числовое поле: InputNumber в режиме редактирования,
   * отформатированное число — в режиме просмотра.
   */
  const numericField = (field: EditableField, record: RoomType) => {
    if (editingId === record.id) {
      return (
        <InputNumber
          size="small"
          min={0}
          value={editRow[field] as number}
          onChange={(val) => setEditRow((prev) => ({ ...prev, [field]: val ?? 0 }))}
          style={{ width: 80 }}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        />
      );
    }
    return (record[field] as number).toLocaleString('ru-RU');
  };

  const columns: TableColumnsType<RoomType> = [
    {
      title: 'Тип номера',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 130,
      render: (_, record) =>
        editingId === record.id ? (
          <Input
            size="small"
            value={editRow.name}
            onChange={(e) => setEditRow((prev) => ({ ...prev, name: e.target.value }))}
            style={{ width: 110 }}
          />
        ) : (
          record.name
        ),
    },
    {
      title: 'Будни',
      dataIndex: 'priceWeekday',
      key: 'priceWeekday',
      width: 100,
      render: (_, record) => numericField('priceWeekday', record),
    },
    {
      title: 'Выходные (1 ночь)',
      dataIndex: 'priceWeekend1',
      key: 'priceWeekend1',
      width: 140,
      render: (_, record) => numericField('priceWeekend1', record),
    },
    {
      title: 'Выходные (пт+сб)',
      dataIndex: 'priceWeekend2',
      key: 'priceWeekend2',
      width: 140,
      render: (_, record) => numericField('priceWeekend2', record),
    },
    {
      title: 'Доп. взрослый (будни)',
      dataIndex: 'adultWeekday',
      key: 'adultWeekday',
      width: 160,
      render: (_, record) => numericField('adultWeekday', record),
    },
    {
      title: 'Доп. взрослый (выходные)',
      dataIndex: 'adultWeekend',
      key: 'adultWeekend',
      width: 175,
      render: (_, record) => numericField('adultWeekend', record),
    },
    {
      title: 'Доп. ребёнок',
      dataIndex: 'childRate',
      key: 'childRate',
      width: 120,
      render: (_, record) => numericField('childRate', record),
    },
    {
      title: 'Доп. мест',
      dataIndex: 'maxExtraGuests',
      key: 'maxExtraGuests',
      width: 100,
      render: (_, record) => numericField('maxExtraGuests', record),
    },
    {
      title: 'Действие',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_, record) =>
        editingId === record.id ? (
          <Space>
            <Button type="link" size="small" onClick={() => saveEdit(record.id)}>
              Сохранить
            </Button>
            <Button type="link" size="small" danger onClick={cancelEdit}>
              Отмена
            </Button>
          </Space>
        ) : (
          <Button
            type="link"
            size="small"
            disabled={editingId !== null}
            onClick={() => startEdit(record)}
          >
            Изменить
          </Button>
        ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={4} style={{ margin: 0 }}>
          Справочник типов номеров
        </Title>
        <Popconfirm
          title="Сбросить все тарифы к исходным значениям из Excel?"
          onConfirm={handleReset}
          okText="Да"
          cancelText="Нет"
        >
          <Button danger size="small">
            Сбросить к исходным
          </Button>
        </Popconfirm>
      </Space>
      <Table
        dataSource={roomTypes}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 1500 }}
        bordered
      />
    </div>
  );
};

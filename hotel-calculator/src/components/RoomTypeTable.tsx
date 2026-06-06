import React, { useState } from 'react';
import { Table, InputNumber, Input, Button, Space, Popconfirm, Typography, message } from 'antd';
import type { RoomType } from '../types';
import { DEFAULT_ROOM_TYPES } from '../data/defaultRoomTypes';
import { saveRoomTypes } from '../lib/storage';

const { Title } = Typography;

interface Props {
  roomTypes: RoomType[];
  onChange: (roomTypes: RoomType[]) => void;
}

type EditableField = keyof Omit<RoomType, 'id'>;

export const RoomTypeTable: React.FC<Props> = ({ roomTypes, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Partial<RoomType>>({});

  const startEdit = (record: RoomType) => {
    setEditingId(record.id);
    setEditRow({ ...record });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({});
  };

  const saveEdit = (id: string) => {
    const updated = roomTypes.map((r) =>
      r.id === id ? { ...r, ...editRow } : r
    );
    onChange(updated);
    saveRoomTypes(updated);
    setEditingId(null);
    setEditRow({});
    message.success('Сохранено');
  };

  const handleReset = () => {
    onChange(DEFAULT_ROOM_TYPES);
    saveRoomTypes(DEFAULT_ROOM_TYPES);
    message.success('Справочник сброшен к исходным значениям');
  };

  const numericField = (field: EditableField, record: RoomType) => {
    if (editingId === record.id) {
      return (
        <InputNumber
          size="small"
          min={0}
          value={editRow[field] as number}
          onChange={(val) => setEditRow((prev) => ({ ...prev, [field]: val ?? 0 }))}
          style={{ width: 90 }}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        />
      );
    }
    return (record[field] as number).toLocaleString('ru-RU');
  };

  const columns = [
    {
      title: 'Тип номера',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 130,
      render: (_: string, record: RoomType) =>
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
      width: 110,
      render: (_: number, record: RoomType) => numericField('priceWeekday', record),
    },
    {
      title: 'Выходные (1 ночь)',
      dataIndex: 'priceWeekend1',
      key: 'priceWeekend1',
      width: 140,
      render: (_: number, record: RoomType) => numericField('priceWeekend1', record),
    },
    {
      title: 'Выходные (пт+сб)',
      dataIndex: 'priceWeekend2',
      key: 'priceWeekend2',
      width: 150,
      render: (_: number, record: RoomType) => numericField('priceWeekend2', record),
    },
    {
      title: 'Доп. взрослый (будни)',
      dataIndex: 'adultWeekday',
      key: 'adultWeekday',
      width: 170,
      render: (_: number, record: RoomType) => numericField('adultWeekday', record),
    },
    {
      title: 'Доп. взрослый (выходные)',
      dataIndex: 'adultWeekend',
      key: 'adultWeekend',
      width: 190,
      render: (_: number, record: RoomType) => numericField('adultWeekend', record),
    },
    {
      title: 'Доп. ребёнок',
      dataIndex: 'childRate',
      key: 'childRate',
      width: 130,
      render: (_: number, record: RoomType) => numericField('childRate', record),
    },
    {
      title: 'Действие',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: unknown, record: RoomType) =>
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
        scroll={{ x: 1350 }}
        bordered
      />
    </div>
  );
};

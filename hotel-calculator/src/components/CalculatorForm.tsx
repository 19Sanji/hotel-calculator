import React, { useEffect } from 'react';
import {
  Form,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Alert,
  Select,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { RoomType, CalculationInput } from '../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface FormValues {
  roomTypeId: string;
  dateRange: [Dayjs, Dayjs];
  adults: number;
  children: number;
  bookingDate: Dayjs;
  isBirthday: boolean;
  manualDiscountPercent?: number;
}

interface Props {
  roomTypes: RoomType[];
  onCalculate: (input: CalculationInput) => void;
  error: string | null;
  initialValues?: CalculationInput;
}

/**
 * Конвертирует CalculationInput (с нативными Date) в значения полей формы Ant Design.
 * Используется для заполнения initialValues при монтировании формы.
 */
function toFormValues(v: CalculationInput): Partial<FormValues> {
  return {
    roomTypeId: v.roomTypeId,
    dateRange: [dayjs(v.checkIn), dayjs(v.checkOut)],
    adults: v.adults,
    children: v.children,
    bookingDate: dayjs(v.bookingDate),
    isBirthday: v.isBirthday,
    manualDiscountPercent: v.manualDiscountPercent,
  };
}

/**
 * Форма ввода параметров для расчёта стоимости номера.
 *
 * Доп. взрослые и дети делят единый пул мест (maxExtraGuests):
 * adults + children ≤ maxExtraGuests.
 * При смене номера значения автоматически зажимаются под новый лимит.
 * Компонент перемонтируется при смене key (panel.id), поэтому
 * initialValues достаточно для заполнения при редактировании.
 */
export const CalculatorForm: React.FC<Props> = ({ roomTypes, onCalculate, error, initialValues }) => {
  const [form] = Form.useForm<FormValues>();

  // Реактивно следим за выбранным типом номера и текущими значениями доп. мест
  const selectedRoomTypeId = Form.useWatch('roomTypeId', form);
  const adultsWatch: number = Form.useWatch('adults', form) ?? 0;
  const childrenWatch: number = Form.useWatch('children', form) ?? 0;

  const selectedRoom = roomTypes.find((r) => r.id === selectedRoomTypeId);
  const maxExtra = selectedRoom?.maxExtraGuests ?? null;

  // Оба инпута заблокированы, если доп. мест нет совсем
  const noExtra = !!selectedRoom && maxExtra === 0;

  // Динамический максимум каждого поля = оставшийся пул после заполнения другого
  const adultsMax = maxExtra !== null && maxExtra > 0 ? maxExtra - childrenWatch : undefined;
  const childrenMax = maxExtra !== null && maxExtra > 0 ? maxExtra - adultsWatch : undefined;

  /**
   * При смене типа номера зажимаем доп. места до нового лимита.
   * Если лимит 0 — сбрасываем оба поля.
   */
  useEffect(() => {
    if (!selectedRoom) return;
    const { adults = 0, children = 0 } = form.getFieldsValue(['adults', 'children']);
    if (selectedRoom.maxExtraGuests === 0) {
      if (adults !== 0) form.setFieldValue('adults', 0);
      if (children !== 0) form.setFieldValue('children', 0);
    } else if (adults + children > selectedRoom.maxExtraGuests) {
      // Сначала обрезаем детей, затем взрослых если всё ещё не помещается
      const newChildren = Math.max(0, selectedRoom.maxExtraGuests - adults);
      const newAdults = adults > selectedRoom.maxExtraGuests ? selectedRoom.maxExtraGuests : adults;
      if (newChildren !== children) form.setFieldValue('children', newChildren);
      if (newAdults !== adults) form.setFieldValue('adults', newAdults);
    }
  }, [selectedRoom, form]);

  /** Собирает значения формы в CalculationInput и передаёт наверх. */
  const handleFinish = (values: FormValues) => {
    const [checkIn, checkOut] = values.dateRange;
    onCalculate({
      roomTypeId: values.roomTypeId,
      checkIn: checkIn.toDate(),
      checkOut: checkOut.toDate(),
      adults: values.adults ?? 0,
      children: values.children ?? 0,
      bookingDate: values.bookingDate.toDate(),
      isBirthday: values.isBirthday ?? false,
      manualDiscountPercent: values.manualDiscountPercent ?? 0,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={
        initialValues
          ? toFormValues(initialValues)
          : { adults: 0, children: 0, isBirthday: false }
      }
    >
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Тип номера"
            name="roomTypeId"
            rules={[{ required: true, message: 'Выберите тип номера' }]}
          >
            <Select placeholder="Выберите тип номера" showSearch optionFilterProp="children">
              {roomTypes.map((r) => (
                <Option key={r.id} value={r.id}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Даты заезда — выезда"
            name="dateRange"
            rules={[
              { required: true, message: 'Укажите даты заезда и выезда' },
              {
                validator(_, value) {
                  if (!value || !value[0] || !value[1]) return Promise.resolve();
                  if (value[1].isAfter(value[0])) return Promise.resolve();
                  return Promise.reject(new Error('Дата выезда должна быть позже даты заезда'));
                },
              },
            ]}
          >
            <RangePicker
              format="DD.MM.YYYY"
              style={{ width: '100%' }}
              placeholder={['Заезд', 'Выезд']}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Form.Item
            label="Доп. взрослых"
            name="adults"
            rules={[{ required: true, message: 'Укажите количество' }]}
          >
            <InputNumber
              min={0}
              max={adultsMax}
              disabled={noExtra}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Form.Item
            label="Доп. детей"
            name="children"
          >
            <InputNumber
              min={0}
              max={childrenMax}
              disabled={noExtra}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Дата бронирования"
            name="bookingDate"
            rules={[{ required: true, message: 'Укажите дату бронирования' }]}
          >
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={4}>
          <Form.Item label="Именинник?" name="isBirthday" valuePropName="checked">
            <Switch checkedChildren="Да" unCheckedChildren="Нет" />
          </Form.Item>
        </Col>
      </Row>

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <Form.Item
          label="Ручная скидка, %"
          name="manualDiscountPercent"
          style={{ marginBottom: 0, minWidth: 160 }}
          rules={[
            {
              validator(_, value) {
                if (value == null || value === '') return Promise.resolve();
                if (value >= 0 && value <= 100) return Promise.resolve();
                return Promise.reject(new Error('От 0 до 100'));
              },
            },
          ]}
        >
          <InputNumber min={0} max={100} style={{ width: 160 }} placeholder="0" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit">
            Рассчитать стоимость
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

import React from 'react';
import {
  Form,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Alert,
} from 'antd';
import type { Dayjs } from 'dayjs';
import type { RoomType, CalculationInput } from '../types';

const { Option } = Select;

interface FormValues {
  roomTypeId: string;
  checkIn: Dayjs;
  checkOut: Dayjs;
  adults: number;
  children: number;
  bookingDate: Dayjs;
  isBirthday: boolean;
}

interface Props {
  roomTypes: RoomType[];
  onCalculate: (input: CalculationInput) => void;
  error: string | null;
}

export const CalculatorForm: React.FC<Props> = ({ roomTypes, onCalculate, error }) => {
  const [form] = Form.useForm<FormValues>();

  const handleFinish = (values: FormValues) => {
    onCalculate({
      roomTypeId: values.roomTypeId,
      checkIn: values.checkIn.toDate(),
      checkOut: values.checkOut.toDate(),
      adults: values.adults,
      children: values.children ?? 0,
      bookingDate: values.bookingDate.toDate(),
      isBirthday: values.isBirthday ?? false,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ adults: 0, children: 0, isBirthday: false }}
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
            label="Дата заезда"
            name="checkIn"
            rules={[{ required: true, message: 'Укажите дату заезда' }]}
          >
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item
            label="Дата выезда"
            name="checkOut"
            dependencies={['checkIn']}
            rules={[
              { required: true, message: 'Укажите дату выезда' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('checkIn')) return Promise.resolve();
                  if (value.isAfter(getFieldValue('checkIn'))) return Promise.resolve();
                  return Promise.reject(new Error('Дата выезда должна быть позже даты заезда'));
                },
              }),
            ]}
          >
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            label="Доп. взрослых"
            name="adults"
            rules={[{ required: true, message: 'Укажите количество доп. взрослых' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Количество детей" name="children">
            <InputNumber min={0} style={{ width: '100%' }} />
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

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large">
          Рассчитать стоимость
        </Button>
      </Form.Item>
    </Form>
  );
};

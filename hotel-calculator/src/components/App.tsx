import React, { useState } from 'react';
import { ConfigProvider, Layout, Tabs, Typography } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { RoomType, CalculationInput, CalculationResult } from '../types';
import { loadRoomTypes } from '../lib/storage';
import { calculate } from '../lib/calculator';
import { CalculatorForm } from './CalculatorForm';
import { ResultDisplay } from './ResultDisplay';
import { RoomTypeTable } from './RoomTypeTable';

dayjs.locale('ru');

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(loadRoomTypes);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('calculator');

  const handleCalculate = (input: CalculationInput) => {
    try {
      setError(null);
      const res = calculate(input, roomTypes);
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  };

  const tabs = [
    {
      key: 'calculator',
      label: 'Калькулятор',
      children: (
        <div>
          <CalculatorForm
            roomTypes={roomTypes}
            onCalculate={handleCalculate}
            error={error}
          />
          {result && <ResultDisplay result={result} />}
        </div>
      ),
    },
    {
      key: 'reference',
      label: 'Справочник цен',
      children: (
        <RoomTypeTable roomTypes={roomTypes} onChange={setRoomTypes} />
      ),
    },
  ];

  return (
    <ConfigProvider locale={ruRU}>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{ background: '#1a3c5e', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            🏨 Калькулятор стоимости проживания
          </Title>
        </Header>
        <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabs}
              size="large"
            />
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

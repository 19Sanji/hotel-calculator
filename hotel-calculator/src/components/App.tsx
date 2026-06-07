import React, { useState } from 'react';
import { ConfigProvider, Layout, Tabs, Typography } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { Order, CalculationPanel, CalculationInput, RoomType } from '../types';
import { loadRoomTypes } from '../lib/storage';
import { calculate } from '../lib/calculator';
import { OrderPanel } from './OrderPanel';
import { CalculationsRegistry } from './CalculationsRegistry';
import { RoomTypeTable } from './RoomTypeTable';

dayjs.locale('ru');

const { Content } = Layout;
const { Title } = Typography;

/** Создаёт новую пустую панель расчёта с уникальным UUID. */
const createPanel = (): CalculationPanel => ({
  id: crypto.randomUUID(),
  input: null,
  result: null,
  selectedDiscountIdx: 0,
});

/** Создаёт новый заказ с одной пустой панелью. */
const createOrder = (): Order => ({
  id: crypto.randomUUID(),
  panels: [createPanel()],
});

/**
 * Корневой компонент приложения.
 * Управляет состоянием текущего заказа, реестра сохранённых заказов
 * и справочника типов номеров.
 */
const App: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(loadRoomTypes);
  const [currentOrder, setCurrentOrder] = useState<Order>(createOrder);
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('registry');

  // --- Обработчики заказа ---

  /** Создаёт новый пустой заказ и открывает вкладку Калькулятор. */
  const newOrder = () => {
    setCurrentOrder(createOrder());
    setActiveTab('calculator');
  };

  /**
   * Сохраняет текущий заказ в реестр (или обновляет существующую запись).
   * Обновляет savedName у currentOrder, чтобы заголовок карточки отражал имя.
   */
  const saveOrder = (name: string) => {
    const updated: Order = { ...currentOrder, savedName: name };
    setCurrentOrder(updated);
    setSavedOrders((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      return idx >= 0
        ? prev.map((s) => (s.id === updated.id ? updated : s))
        : [...prev, updated];
    });
  };

  /**
   * Загружает сохранённый заказ в калькулятор для редактирования.
   * Создаёт копию с новыми UUID, чтобы изменения не затронули сохранённую запись.
   */
  const editSavedOrder = (orderId: string) => {
    const order = savedOrders.find((s) => s.id === orderId);
    if (!order) return;
    setCurrentOrder({
      id: crypto.randomUUID(),
      savedName: undefined,
      panels: order.panels.map((p) => ({ ...p, id: crypto.randomUUID() })),
    });
    setActiveTab('calculator');
  };

  /** Удаляет заказ из реестра по id. */
  const deleteSavedOrder = (orderId: string) =>
    setSavedOrders((prev) => prev.filter((s) => s.id !== orderId));

  // --- Обработчики панелей ---

  /** Добавляет пустую панель расчёта в текущий заказ. */
  const addPanel = () =>
    setCurrentOrder((o) => ({ ...o, panels: [...o.panels, createPanel()] }));

  /** Удаляет панель из текущего заказа (минимум одна панель должна оставаться). */
  const removePanel = (panelId: string) =>
    setCurrentOrder((o) => {
      if (o.panels.length <= 1) return o;
      return { ...o, panels: o.panels.filter((p) => p.id !== panelId) };
    });

  /**
   * Дублирует панель расчёта, вставляя копию сразу после оригинала.
   * Копии присваивается новый UUID.
   */
  const duplicatePanel = (panelId: string) =>
    setCurrentOrder((o) => {
      const src = o.panels.find((p) => p.id === panelId);
      if (!src) return o;
      const newPanel: CalculationPanel = { ...src, id: crypto.randomUUID() };
      const idx = o.panels.indexOf(src);
      const panels = [...o.panels];
      panels.splice(idx + 1, 0, newPanel);
      return { ...o, panels };
    });

  /**
   * Запускает расчёт для указанной панели.
   * Автоматически выбирает наилучший индекс скидки по максимальной сумме.
   */
  const handleCalculate = (panelId: string, input: CalculationInput) =>
    setCurrentOrder((o) => ({
      ...o,
      panels: o.panels.map((p) => {
        if (p.id !== panelId) return p;
        try {
          const result = calculate(input, roomTypes);
          const bestIdx = result.allDiscounts.reduce(
            (best, d, i) => (d.amount > result.allDiscounts[best].amount ? i : best),
            0
          );
          return { ...p, input, result, selectedDiscountIdx: bestIdx };
        } catch {
          return { ...p, input, result: null, selectedDiscountIdx: 0 };
        }
      }),
    }));

  /** Меняет выбранную скидку для указанной панели. */
  const setDiscount = (panelId: string, idx: number) =>
    setCurrentOrder((o) => ({
      ...o,
      panels: o.panels.map((p) =>
        p.id === panelId ? { ...p, selectedDiscountIdx: idx } : p
      ),
    }));

  // --- Содержимое вкладок ---

  const calculatorContent = (
    <OrderPanel
      order={currentOrder}
      roomTypes={roomTypes}
      onAddPanel={addPanel}
      onCalculate={(panelId, input) => handleCalculate(panelId, input)}
      onDiscount={(panelId, idx) => setDiscount(panelId, idx)}
      onDuplicate={(panelId) => duplicatePanel(panelId)}
      onRemovePanel={(panelId) => removePanel(panelId)}
      onSave={(name) => saveOrder(name)}
    />
  );

  const tabItems = [
    { key: 'calculator', label: 'Калькулятор' },
    {
      key: 'registry',
      label: `Реестр заказов${savedOrders.length > 0 ? ` (${savedOrders.length})` : ''}`,
    },
    { key: 'reference', label: 'Справочник цен' },
  ];

  const tabContent: Record<string, React.ReactNode> = {
    calculator: calculatorContent,
    registry: (
      <CalculationsRegistry
        savedOrders={savedOrders}
        roomTypes={roomTypes}
        onNew={newOrder}
        onEdit={editSavedOrder}
        onDelete={deleteSavedOrder}
      />
    ),
    reference: <RoomTypeTable roomTypes={roomTypes} onChange={setRoomTypes} />,
  };

  return (
    <ConfigProvider locale={ruRU}>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        {/* Тёмная шапка с навигацией */}
        <div style={{ background: '#1a3c5e' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <ConfigProvider
              theme={{
                components: {
                  Tabs: {
                    itemColor: 'rgba(255,255,255,0.65)',
                    itemSelectedColor: '#fff',
                    itemHoverColor: '#fff',
                    inkBarColor: '#fff',
                    colorBorderSecondary: 'rgba(255,255,255,0.15)',
                    titleFontSize: 15,
                  },
                },
              }}
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                tabBarStyle={{ marginBottom: 0 }}
                tabBarExtraContent={{
                  left: (
                    <Title
                      level={4}
                      style={{ color: '#fff', margin: '0 32px 0 0', whiteSpace: 'nowrap' }}
                    >
                      🏨 Бухта Кила
                    </Title>
                  ),
                }}
              />
            </ConfigProvider>
          </div>
        </div>

        <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: 24 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,.1)',
              padding: 24,
            }}
          >
            {tabContent[activeTab]}
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

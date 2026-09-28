import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { getOrders } from '../db';
import { playClickSound } from '../utils/sounds';
import { syncOrders } from '../utils/sync';

interface DashboardProps {
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const allOrders = await getOrders();
    setOrders(allOrders);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = todayOrders.filter(o => o.status === 'pending').length;
  const preparingOrders = todayOrders.filter(o => o.status === 'preparing').length;
  const readyOrders = todayOrders.filter(o => o.status === 'ready').length;
  const deliveredOrders = todayOrders.filter(o => o.status === 'delivered').length;
  const unsyncedCount = orders.filter(o => !o.synced).length;

  // Category breakdown
  const categoryBreakdown = todayOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      const cat = item.menuItem.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const handleSync = async () => {
    playClickSound();
    const result = await syncOrders();
    await loadOrders();
    alert(`Synced: ${result.synced} orders. Failed: ${result.failed}`);
  };

  // Last 7 days revenue
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = orders.filter(o => o.createdAt.startsWith(dateStr));
    const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
    return { date: dateStr, day: date.toLocaleDateString('en', { weekday: 'short' }), revenue, count: dayOrders.length };
  });

  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">← Back</button>
            <h1 className="text-xl font-bold">📊 Dashboard</h1>
          </div>
          {unsyncedCount > 0 && (
            <button
              onClick={handleSync}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              🔄 Sync ({unsyncedCount})
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
            <p className="text-sm opacity-80">💰 Today's Revenue</p>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm opacity-80">{todayOrders.length} orders</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 text-white">
            <p className="text-sm opacity-80">⏳ Pending</p>
            <p className="text-3xl font-bold">{pendingOrders}</p>
            <p className="text-sm opacity-80">Awaiting action</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-4 text-white">
            <p className="text-sm opacity-80">👨‍🍳 Preparing</p>
            <p className="text-3xl font-bold">{preparingOrders}</p>
            <p className="text-sm opacity-80">In kitchen</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-4 text-white">
            <p className="text-sm opacity-80">✅ Ready</p>
            <p className="text-3xl font-bold">{readyOrders}</p>
            <p className="text-sm opacity-80">{deliveredOrders} delivered</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-lg mb-4">📈 Last 7 Days Revenue</h2>
          <div className="flex items-end gap-2 h-40">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">${day.revenue.toFixed(0)}</span>
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg transition-all"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '8px' : '2px' }}
                />
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-lg mb-4">🍕 Today's Category Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(categoryBreakdown).length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-4">No orders yet today</p>
            ) : (
              Object.entries(categoryBreakdown).map(([cat, count]) => {
                const emojis: Record<string, string> = {
                  pizza: '🍕', burger: '🍔', shawarma: '🌯', sides: '🍟', drinks: '🥤'
                };
                return (
                  <div key={cat} className="bg-gray-50 rounded-xl p-3 text-center">
                    <span className="text-2xl">{emojis[cat] || '📦'}</span>
                    <p className="font-bold text-lg">{count}</p>
                    <p className="text-xs text-gray-500 capitalize">{cat}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">🕐 Recent Orders</h2>
          <div className="space-y-2">
            {todayOrders.slice(0, 10).reverse().map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{order.orderId}</span>
                  <span className="text-sm text-gray-500">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-600">${order.total.toFixed(2)}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {todayOrders.length === 0 && (
              <p className="text-gray-400 text-center py-4">No orders today yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

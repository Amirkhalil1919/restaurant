import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { getOrders, updateOrderStatus } from '../db';
import { playClickSound, playNotificationSound } from '../utils/sounds';
import { syncOrders } from '../utils/sync';

interface OrderHistoryProps {
  onBack: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const allOrders = await getOrders();
    setOrders(allOrders);
  };

  const handleStatusChange = async (id: number, status: Order['status']) => {
    playClickSound();
    await updateOrderStatus(id, status);
    await loadOrders();
  };

  const handleSync = async () => {
    playClickSound();
    const result = await syncOrders();
    playNotificationSound();
    await loadOrders();
    alert(`Synced: ${result.synced} orders. Failed: ${result.failed}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchTerm === '' || 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    preparing: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-gray-100 text-gray-600',
  };

  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    preparing: '👨‍🍳',
    ready: '✅',
    delivered: '📦',
  };

  const todayOrders = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    return o.createdAt.startsWith(today);
  });

  const unsyncedCount = orders.filter(o => !o.synced).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">← Back</button>
            <h1 className="text-xl font-bold">📋 Order History</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Today: {todayOrders.length} orders
            </span>
            {unsyncedCount > 0 && (
              <button
                onClick={handleSync}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                🔄 Sync ({unsyncedCount})
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search orders..."
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none flex-1 min-w-[200px]"
          />
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'preparing', 'ready', 'delivered'].map(status => (
              <button
                key={status}
                onClick={() => { playClickSound(); setFilter(status); }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? '📋' : statusEmojis[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-5xl block mb-3">📭</span>
              <p>No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{order.orderId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusEmojis[order.status]} {order.status}
                      </span>
                      {!order.synced && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                          ⏳ Not synced
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      👤 {order.customerName} • {order.orderType}
                      {order.tableNumber && ` • Table ${order.tableNumber}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 text-lg">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  {order.items.map((item, i) => (
                    <span key={i} className="text-sm mr-3">
                      {item.menuItem.emoji} {item.menuItem.name}
                      {item.variant && ` (${item.variant})`} ×{item.quantity}
                    </span>
                  ))}
                  {order.notes && (
                    <p className="text-sm text-amber-600 mt-1">📝 {order.notes}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'preparing')}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                    >
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'ready')}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                    >
                      ✅ Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'delivered')}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
                    >
                      📦 Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

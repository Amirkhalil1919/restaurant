import React, { useState, useEffect } from 'react';
import { CartItem, Order, MenuItem } from '../types';
import { menuItems, categories } from '../utils/menu';
import { addOrder, getNextOrderNumber } from '../db';
import { playClickSound, playAddToCartSound, playRemoveFromCartSound, playOrderPlacedSound } from '../utils/sounds';

interface OrderTakingProps {
  userName: string;
  isAdmin: boolean;
  onViewHistory: () => void;
  onViewDashboard: () => void;
  onViewSettings: () => void;
}

export const OrderTaking: React.FC<OrderTakingProps> = ({ userName, isAdmin, onViewHistory, onViewDashboard, onViewSettings }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleItemClick = (item: MenuItem) => {
    playClickSound();
    if (item.variants && item.variants.length > 0) {
      setSelectedItem(item);
      setSelectedVariant(item.variants[0].name);
    } else {
      addToCart(item);
    }
  };

  const addToCart = (item: MenuItem, variant?: string, qty: number = 1) => {
    playAddToCartSound();
    setCart(prev => {
      const existing = prev.find(
        c => c.menuItem.id === item.id && c.variant === variant
      );
      if (existing) {
        return prev.map(c =>
          c.menuItem.id === item.id && c.variant === variant
            ? { ...c, quantity: c.quantity + qty }
            : c
        );
      }
      return [...prev, { menuItem: item, quantity: qty, variant }];
    });
    setSelectedItem(null);
  };

  const removeFromCart = (index: number) => {
    playRemoveFromCartSound();
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    playClickSound();
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const getItemPrice = (item: CartItem): number => {
    if (item.variant && item.menuItem.variants) {
      const variant = item.menuItem.variants.find(v => v.name === item.variant);
      return variant ? variant.price : item.menuItem.price;
    }
    return item.menuItem.price;
  };

  const cartTotal = cart.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const orderId = await getNextOrderNumber();
      const order: Order = {
        orderId,
        customerName: customerName || 'Walk-in',
        customerPhone: customerPhone || '',
        orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        items: cart,
        total: cartTotal,
        notes: orderNotes,
        status: 'pending',
        createdBy: userName,
        createdAt: new Date().toISOString(),
        synced: false
      };

      await addOrder(order);
      playOrderPlacedSound();
      
      setSuccessMessage(`✅ Order ${orderId} placed successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setTableNumber('');
      setOrderNotes('');
      setShowCheckout(false);
    } catch (error) {
      console.error('Failed to save order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">Order Manager</h1>
              <p className="text-xs text-gray-500">👤 {userName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {online ? '🟢 Online' : '🔴 Offline'}
            </span>
            
            {cartCount > 0 && (
              <button
                onClick={() => { playClickSound(); setShowCart(true); }}
                className="relative bg-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                🛒 Cart
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              </button>
            )}

            {isAdmin && (
              <div className="flex gap-1 ml-2">
                <button onClick={onViewDashboard} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Dashboard">
                  📊
                </button>
                <button onClick={onViewHistory} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Order History">
                  📋
                </button>
                <button onClick={onViewSettings} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
                  ⚙️
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
          {successMessage}
        </div>
      )}

      {/* Categories */}
      <div className="bg-white border-b border-gray-100 sticky top-[68px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { playClickSound(); setActiveCategory(cat.id); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white rounded-2xl p-4 text-left hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all border border-gray-100 group"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
              <p className="text-orange-600 font-bold mt-1">
                ${item.variants ? item.variants[0].price.toFixed(2) : item.price.toFixed(2)}
                {item.variants && <span className="text-xs text-gray-400 font-normal">+</span>}
              </p>
            </button>
          ))}
        </div>
      </main>

      {/* Variant Selection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <span className="text-5xl">{selectedItem.emoji}</span>
              <h3 className="text-xl font-bold mt-2">{selectedItem.name}</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-600">Choose size:</p>
              {selectedItem.variants?.map(variant => (
                <button
                  key={variant.name}
                  onClick={() => { playClickSound(); setSelectedVariant(variant.name); }}
                  className={`w-full p-3 rounded-xl text-left flex justify-between items-center transition-all ${
                    selectedVariant === variant.name
                      ? 'bg-orange-100 border-2 border-orange-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{variant.name}</span>
                  <span className="font-bold text-orange-600">${variant.price.toFixed(2)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => addToCart(selectedItem, selectedVariant)}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95"
            >
              Add to Cart 🛒
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold">🛒 Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="text-5xl mb-3">🛒</span>
                <p>Cart is empty</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-3">
                  {cart.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-2xl">{item.menuItem.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.menuItem.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                        <p className="text-orange-600 font-bold text-sm">${(getItemPrice(item) * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200 text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-orange-600">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => { playClickSound(); setShowCart(false); setShowCheckout(true); }}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all active:scale-95"
                  >
                    Proceed to Checkout 💳
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">📝 Order Details</h2>
            
            <div className="space-y-4">
              {/* Order Type */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Order Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dine-in', 'takeaway', 'delivery'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => { playClickSound(); setOrderType(type); }}
                      className={`p-2 rounded-xl text-sm font-medium transition-all ${
                        orderType === type
                          ? 'bg-orange-100 border-2 border-orange-400 text-orange-700'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {type === 'dine-in' ? '🪑' : type === 'takeaway' ? '🥡' : '🚗'} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in customer"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none"
                />
              </div>

              {orderType === 'dine-in' && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Table Number</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g., T5"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Special Notes</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special requests..."
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none resize-none h-20"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-3">
                <h3 className="font-medium text-sm mb-2">📋 Order Summary</h3>
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{item.menuItem.emoji} {item.menuItem.name}{item.variant ? ` (${item.variant})` : ''} ×{item.quantity}</span>
                    <span className="font-medium">${(getItemPrice(item) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? '⏳ Placing Order...' : '✅ Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

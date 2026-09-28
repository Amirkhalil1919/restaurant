export interface MenuItem {
  id: string;
  name: string;
  category: 'pizza' | 'burger' | 'shawarma' | 'sides' | 'drinks';
  price: number;
  emoji: string;
  variants?: { name: string; price: number }[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  variant?: string;
  notes?: string;
}

export interface Order {
  id?: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  items: CartItem[];
  total: number;
  notes: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdBy: string;
  createdAt: string;
  synced: boolean;
}

export interface AppSettings {
  googleSheetUrl: string;
  restaurantName: string;
  currency: string;
}

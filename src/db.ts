import Dexie, { type Table } from 'dexie';
import { Order, AppSettings } from './types';

export class RestaurantDB extends Dexie {
  orders!: Table<Order, number>;
  settings!: Table<AppSettings & { id: number }, number>;

  constructor() {
    super('RestaurantOrders');
    this.version(1).stores({
      orders: '++id, orderId, createdAt, status, synced, createdBy',
      settings: '++id'
    });
  }
}

export const db = new RestaurantDB();

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.toCollection().first();
  return settings || { googleSheetUrl: '', restaurantName: 'Restaurant', currency: '$' };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const existing = await db.settings.toCollection().first();
  if (existing) {
    await db.settings.update(existing.id!, settings);
  } else {
    await db.settings.add({ ...settings, id: 1 });
  }
}

export async function addOrder(order: Order): Promise<number> {
  return await db.orders.add(order);
}

export async function getOrders(): Promise<Order[]> {
  return await db.orders.orderBy('createdAt').reverse().toArray();
}

export async function getUnsyncedOrders(): Promise<Order[]> {
  return await db.orders.where('synced').equals(0).toArray();
}

export async function markAsSynced(id: number): Promise<void> {
  await db.orders.update(id, { synced: true });
}

export async function updateOrderStatus(id: number, status: Order['status']): Promise<void> {
  await db.orders.update(id, { status });
}

export async function getNextOrderNumber(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = await db.orders
    .where('createdAt')
    .between(`${today}T00:00:00`, `${today}T23:59:59`)
    .count();
  return `ORD-${today.replace(/-/g, '')}-${String(todayOrders + 1).padStart(3, '0')}`;
}

import { Order } from '../types';
import { getSettings, getUnsyncedOrders, markAsSynced } from '../db';
import { playSyncSuccessSound, playSyncErrorSound } from './sounds';

export async function syncOrders(): Promise<{ synced: number; failed: number }> {
  const settings = await getSettings();
  
  if (!settings.googleSheetUrl) {
    return { synced: 0, failed: 0 };
  }

  const unsyncedOrders = await getUnsyncedOrders();
  
  if (unsyncedOrders.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const order of unsyncedOrders) {
    try {
      const payload = {
        orderId: order.orderId,
        timestamp: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderType: order.orderType,
        tableNumber: order.tableNumber || '',
        items: order.items.map(item => 
          `${item.menuItem.emoji} ${item.menuItem.name}${item.variant ? ` (${item.variant})` : ''} x${item.quantity}`
        ).join(', '),
        total: order.total,
        notes: order.notes,
        status: order.status,
        createdBy: order.createdBy
      };

      const response = await fetch(settings.googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // With no-cors, we can't read the response, but if no error thrown, consider it sent
      if (order.id) {
        await markAsSynced(order.id);
      }
      synced++;
    } catch (error) {
      console.error('Failed to sync order:', order.orderId, error);
      failed++;
    }
  }

  if (synced > 0) {
    playSyncSuccessSound();
  }
  if (failed > 0) {
    playSyncErrorSound();
  }

  return { synced, failed };
}

export function startAutoSync(intervalMs: number = 30000) {
  const sync = async () => {
    if (navigator.onLine) {
      await syncOrders();
    }
  };

  // Initial sync
  sync();

  // Periodic sync
  const intervalId = setInterval(sync, intervalMs);

  // Sync when coming back online
  const onlineHandler = () => {
    sync();
  };
  window.addEventListener('online', onlineHandler);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('online', onlineHandler);
  };
}

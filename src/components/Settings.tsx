import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { getSettings, saveSettings } from '../db';
import { playClickSound, playNotificationSound } from '../utils/sounds';
import { syncOrders } from '../utils/sync';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings>({
    googleSheetUrl: '',
    restaurantName: 'Restaurant',
    currency: '$'
  });
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  const handleSave = async () => {
    playClickSound();
    await saveSettings(settings);
    setSaved(true);
    playNotificationSound();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    playClickSound();
    const result = await syncOrders();
    setSyncing(false);
    playNotificationSound();
    alert(`Sync complete!\n✅ Synced: ${result.synced}\n❌ Failed: ${result.failed}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">← Back</button>
            <h1 className="text-xl font-bold">⚙️ Settings</h1>
          </div>
          {saved && (
            <span className="text-green-600 font-medium animate-pulse">✅ Saved!</span>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Google Sheets Configuration */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-1">📊 Google Sheets Integration</h2>
          <p className="text-sm text-gray-500 mb-4">
            Connect your Google Sheet to automatically log all orders.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Google Apps Script Web App URL</label>
              <input
                type="url"
                value={settings.googleSheetUrl}
                onChange={(e) => setSettings(s => ({ ...s, googleSheetUrl: e.target.value }))}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none text-sm"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-medium text-amber-800 mb-2">📝 Setup Instructions:</h3>
              <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                <li>Open Google Sheets → Extensions → Apps Script</li>
                <li>Paste the Apps Script code (see below)</li>
                <li>Deploy → New Deployment → Web App</li>
                <li>Set "Execute as: Me" and "Who has access: Anyone"</li>
                <li>Copy the Web App URL and paste it above</li>
              </ol>
            </div>

            <details className="bg-gray-50 rounded-xl p-4">
              <summary className="font-medium text-gray-700 cursor-pointer">📄 View Apps Script Code</summary>
              <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Add header row if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Order ID', 'Timestamp', 'Customer Name', 
      'Phone', 'Order Type', 'Table', 'Items', 
      'Total', 'Notes', 'Status', 'Staff'
    ]);
  }
  
  sheet.appendRow([
    data.orderId,
    data.timestamp,
    data.customerName,
    data.customerPhone,
    data.orderType,
    data.tableNumber,
    data.items,
    data.total,
    data.notes,
    data.status,
    data.createdBy
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}`}
              </pre>
            </details>
          </div>
        </div>

        {/* Restaurant Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">🏪 Restaurant Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurantName}
                onChange={(e) => setSettings(s => ({ ...s, restaurantName: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Currency Symbol</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings(s => ({ ...s, currency: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none"
                maxLength={3}
              />
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">🔄 Sync Controls</h2>
          <p className="text-sm text-gray-500 mb-4">
            Orders are automatically synced every 30 seconds when online. You can also manually trigger a sync.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all"
          >
            {syncing ? '🔄 Syncing...' : '🔄 Sync Now'}
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all active:scale-[0.98] shadow-lg shadow-orange-200"
        >
          💾 Save Settings
        </button>
      </div>
    </div>
  );
};

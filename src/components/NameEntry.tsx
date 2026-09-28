import React, { useState } from 'react';
import { playClickSound } from '../utils/sounds';

interface NameEntryProps {
  onSubmit: (name: string) => void;
}

export const NameEntry: React.FC<NameEntryProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      playClickSound();
      onSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center transform hover:scale-[1.01] transition-transform">
        <div className="text-6xl mb-4 animate-bounce">🍽️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
        <p className="text-gray-500 mb-8">Enter your name to start taking orders</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">👤</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-bold rounded-2xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-200"
          >
            🚀 Start Taking Orders
          </button>
        </form>
        
        <p className="mt-8 text-sm text-gray-400">
          💡 Admin? Add <code className="bg-gray-100 px-2 py-1 rounded">?ref=Admin</code> to the URL
        </p>
      </div>
    </div>
  );
};

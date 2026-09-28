import React, { useState, useEffect } from 'react';
import { NameEntry } from './components/NameEntry';
import { OrderTaking } from './components/OrderTaking';
import { OrderHistory } from './components/OrderHistory';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { startAutoSync } from './utils/sync';
import { resumeAudioContext } from './utils/sounds';

type View = 'name-entry' | 'order-taking' | 'history' | 'dashboard' | 'settings';

function App() {
  const [view, setView] = useState<View>('name-entry');
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for admin access
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref === 'Admin') {
      setIsAdmin(true);
      setUserName('Admin');
      setView('order-taking');
    }

    // Check for saved user
    const savedUser = localStorage.getItem('restaurant_user');
    if (savedUser && ref !== 'Admin') {
      setUserName(savedUser);
      setView('order-taking');
    }

    // Start auto-sync
    const cleanup = startAutoSync(30000);
    return cleanup;
  }, []);

  const handleNameSubmit = (name: string) => {
    resumeAudioContext();
    setUserName(name);
    localStorage.setItem('restaurant_user', name);
    setView('order-taking');
  };

  return (
    <>
      {view === 'name-entry' && (
        <NameEntry onSubmit={handleNameSubmit} />
      )}
      
      {view === 'order-taking' && (
        <OrderTaking
          userName={userName}
          isAdmin={isAdmin}
          onViewHistory={() => setView('history')}
          onViewDashboard={() => setView('dashboard')}
          onViewSettings={() => setView('settings')}
        />
      )}
      
      {view === 'history' && (
        <OrderHistory onBack={() => setView('order-taking')} />
      )}
      
      {view === 'dashboard' && (
        <Dashboard onBack={() => setView('order-taking')} />
      )}
      
      {view === 'settings' && (
        <Settings onBack={() => setView('order-taking')} />
      )}
    </>
  );
}

export default App;

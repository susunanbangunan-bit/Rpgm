import React, { useEffect, useState } from 'react';
import { Home, Library, Settings as SettingsIcon } from 'lucide-react';
import { HomeScreen } from './screens/HomeScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PlayerScreen } from './screens/PlayerScreen';
import { useAppStore } from './app/store';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const { loadGames, activeGame } = useAppStore();

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  if (activeGame) {
    return <PlayerScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-50 font-sans">
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>
      
      <nav className="bg-neutral-900 border-t border-neutral-800 flex justify-around p-3 pb-safe">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'text-blue-500' : 'text-neutral-400 hover:bg-neutral-800'}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1 font-medium">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'text-blue-500' : 'text-neutral-400 hover:bg-neutral-800'}`}
        >
          <SettingsIcon size={24} />
          <span className="text-xs mt-1 font-medium">Settings</span>
        </button>
      </nav>
    </div>
  );
}

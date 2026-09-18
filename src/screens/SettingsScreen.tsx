import React from 'react';
import { Info, Database, Zap } from 'lucide-react';

export function SettingsScreen() {
  return (
    <div className="p-4 md:p-6 lg:max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Settings</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-1">Engine Manager</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-200">RPG Maker MV</h3>
                <p className="text-sm text-neutral-500">HTML5 Web Runtime</p>
              </div>
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-md">Installed</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-200">RPG Maker MZ</h3>
                <p className="text-sm text-neutral-500">HTML5 Web Runtime</p>
              </div>
              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-md">Installed</span>
            </div>
            <div className="p-4 flex items-center justify-between opacity-50">
              <div>
                <h3 className="font-medium text-neutral-200">RPG Maker XP/VX/Ace</h3>
                <p className="text-sm text-neutral-500">Requires Native RGSS</p>
              </div>
              <span className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs font-bold rounded-md">Not Installed</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-1">About</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center text-neutral-300 mb-4">
              <Zap size={20} className="text-blue-400 mr-3" />
              <div>
                <p className="font-medium">RPGM Player</p>
                <p className="text-sm text-neutral-500">Version 1.0.0-alpha</p>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              A multi-engine game player inspired by JoiPlay. 
              Currently supports running HTML5-based engines (MV/MZ) via a local Virtual Filesystem Service Worker.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

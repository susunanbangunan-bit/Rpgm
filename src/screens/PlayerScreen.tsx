import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { useAppStore } from '../app/store';
import { EngineRegistry } from '../engine/registry/EngineRegistry';
import { VirtualGamepad } from '../components/VirtualGamepad';

export function PlayerScreen() {
  const { activeGame, setActiveGame } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!activeGame || !containerRef.current) return;

    const adapter = EngineRegistry.getAdapter(activeGame.engine);
    if (!adapter) {
      setError(`Engine ${activeGame.engine} is not supported yet.`);
      return;
    }

    let isMounted = true;

    const launch = async () => {
      try {
        await adapter.launch(activeGame, containerRef.current!);
        // The adapter creates an iframe and appends it to container
        // We can find it to send input events
        if (containerRef.current) {
          iframeRef.current = containerRef.current.querySelector('iframe');
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      }
    };

    launch();

    return () => {
      isMounted = false;
      adapter.stop(activeGame);
    };
  }, [activeGame]);

  const handleExit = () => {
    if (confirm('Exit game? Unsaved progress will be lost.')) {
      setActiveGame(null);
    }
  };

  if (error) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-900/20 text-red-400 p-6 rounded-2xl max-w-md border border-red-900/50">
          <h2 className="text-xl font-bold mb-2">Game could not be started</h2>
          <p className="mb-4">Engine: {activeGame?.engine}</p>
          <div className="bg-black/50 p-3 rounded-lg text-sm text-left font-mono mb-6 overflow-x-auto">
            {error}
          </div>
          <button 
            onClick={() => setActiveGame(null)}
            className="bg-neutral-800 hover:bg-neutral-700 px-6 py-2 rounded-full font-medium transition-colors"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative flex flex-col">
      {/* Top Bar (Auto-hide or toggleable) */}
      <div className={`absolute top-0 left-0 right-0 z-50 p-2 flex justify-between items-start transition-opacity duration-300 ${showMenu ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={handleExit}
          className="bg-black/50 backdrop-blur border border-white/10 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={() => setShowMenu(false)}
          className="bg-black/50 backdrop-blur border border-white/10 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Hidden button to toggle menu */}
      <button 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 z-40 opacity-0"
        onClick={() => setShowMenu(p => !p)}
      />

      {/* Game Container */}
      <div ref={containerRef} className="flex-1 w-full h-full" />

      {/* Virtual Gamepad Overlay */}
      {activeGame?.config.touchControls && (
        <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
          <VirtualGamepad 
            onKeyDown={(key) => simulateKeyEvent('keydown', key)} 
            onKeyUp={(key) => simulateKeyEvent('keyup', key)} 
          />
        </div>
      )}
    </div>
  );

  function simulateKeyEvent(type: 'keydown' | 'keyup', key: string) {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    
    // Create and dispatch event inside the iframe
    const event = new KeyboardEvent(type, {
      key: key,
      code: key === 'Enter' ? 'Enter' : key === 'Escape' ? 'Escape' : key === 'Shift' ? 'ShiftLeft' : `Arrow${key.charAt(0).toUpperCase() + key.slice(1)}`,
      keyCode: getKeyCode(key),
      which: getKeyCode(key),
      bubbles: true,
      cancelable: true
    });
    
    iframeRef.current.contentDocument?.dispatchEvent(event);
    iframeRef.current.contentWindow.dispatchEvent(event);
  }
}

function getKeyCode(key: string): number {
  switch (key) {
    case 'ArrowUp': return 38;
    case 'ArrowDown': return 40;
    case 'ArrowLeft': return 37;
    case 'ArrowRight': return 39;
    case 'Enter': return 13; // Z/OK
    case 'Escape': return 27; // X/Cancel
    case 'Shift': return 16;
    default: return 0;
  }
}

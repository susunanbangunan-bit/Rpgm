import React, { useRef, useState } from 'react';
import { Plus, Play, Trash2, HardDrive } from 'lucide-react';
import { useAppStore } from '../app/store';
import { Game } from '../types';
import { extractZipToVFS } from '../filesystem/ZipExtractor';
import { detectEngineFromPaths } from '../engine/detector/EngineDetector';
import { GameFileSystem } from '../filesystem/GameFileSystem';

export function HomeScreen() {
  const { games, addGame, removeGame, setActiveGame, isLoading } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleAddGameClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsExtracting(true);
      setStatus('Analyzing zip...');
      setProgress(0);

      const gameId = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      setStatus('Extracting files...');
      const extractedPaths = await extractZipToVFS(gameId, file, (p) => setProgress(p));

      setStatus('Detecting engine...');
      const detection = detectEngineFromPaths(extractedPaths);

      const newGame: Game = {
        id: gameId,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        engine: detection.engine,
        sizeBytes: file.size,
        addedAt: Date.now(),
        playTimeSeconds: 0,
        path: detection.rootFolder, // root folder inside zip
        config: {
          resolution: 'auto',
          pixelPerfect: false,
          showFps: false,
          touchControls: true
        }
      };

      await addGame(newGame);
      setStatus('Done!');
    } catch (err) {
      console.error(err);
      alert('Failed to add game: ' + (err as Error).message);
    } finally {
      setIsExtracting(false);
      setProgress(0);
      setStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    if (confirm(`Remove ${game.name}?`)) {
      await removeGame(game.id);
      await GameFileSystem.deleteGameFiles(game.id);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RPGM Player</h1>
          <p className="text-neutral-400 text-sm">Your Game Library</p>
        </div>
        
        <button 
          onClick={handleAddGameClick}
          disabled={isExtracting}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-full font-medium flex items-center transition-colors"
        >
          <Plus size={20} className="mr-1" />
          Add Game
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".zip,application/zip,application/x-zip-compressed" 
          onChange={handleFileChange}
          className="hidden" 
        />
      </header>

      {isExtracting && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-300">{status}</span>
            <span className="text-blue-400 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden mb-3">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-neutral-500">
            For large games (&gt;500MB), this process may take a few minutes. Please keep the app open.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-neutral-500">Loading library...</div>
      ) : games.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-3xl flex flex-col items-center">
          <HardDrive size={48} className="text-neutral-700 mb-4" />
          <h3 className="text-lg font-medium text-neutral-300 mb-2">No games found</h3>
          <p className="text-neutral-500 max-w-xs mb-6">
            Add a .zip file containing an RPG Maker MV or MZ game.
          </p>
          <button 
            onClick={handleAddGameClick}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map(game => (
            <div 
              key={game.id} 
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all group flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-neutral-100 line-clamp-1">{game.name}</h3>
                  <button 
                    onClick={(e) => handleDelete(e, game)}
                    className="text-neutral-500 hover:text-red-400 p-1 bg-neutral-950/50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium">
                  <span className={`px-2 py-1 rounded-md ${
                    game.engine === 'mv' ? 'bg-orange-500/10 text-orange-400' :
                    game.engine === 'mz' ? 'bg-purple-500/10 text-purple-400' :
                    game.engine === 'xp' ? 'bg-blue-500/10 text-blue-400' :
                    game.engine === 'vx' || game.engine === 'vxace' ? 'bg-red-500/10 text-red-400' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {game.engine === 'mv' ? 'RPG Maker MV' : 
                     game.engine === 'mz' ? 'RPG Maker MZ' : 
                     game.engine.toUpperCase()}
                  </span>
                  <span className="text-neutral-500">
                    {(game.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                {game.engine !== 'mv' && game.engine !== 'mz' && (
                  <p className="mt-3 text-xs text-red-400/80">
                    Runtime not installed. This engine requires a native adapter.
                  </p>
                )}
              </div>
              <div className="p-3 bg-neutral-950/50 border-t border-neutral-800/50">
                <button 
                  onClick={() => setActiveGame(game)}
                  disabled={game.engine !== 'mv' && game.engine !== 'mz'}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                >
                  <Play size={16} className="mr-2" />
                  PLAY NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

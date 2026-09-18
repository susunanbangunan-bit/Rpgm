import React, { useEffect, useState } from 'react';

interface VirtualGamepadProps {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
}

export function VirtualGamepad({ onKeyDown, onKeyUp }: VirtualGamepadProps) {
  return (
    <div className="w-full h-64 p-4 flex justify-between items-end pointer-events-none">
      {/* D-Pad */}
      <div className="relative w-40 h-40 opacity-50 pointer-events-auto select-none">
        <PadButton keyName="ArrowUp" className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-14 rounded-t-lg" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        <PadButton keyName="ArrowDown" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-14 rounded-b-lg" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        <PadButton keyName="ArrowLeft" className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-12 rounded-l-lg" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        <PadButton keyName="ArrowRight" className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-12 rounded-r-lg" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20"></div>
      </div>

      {/* Action Buttons */}
      <div className="relative w-48 h-40 opacity-50 pointer-events-auto select-none">
        <ActionButton keyName="Enter" label="A" className="absolute right-0 top-1/2 -translate-y-1/2" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        <ActionButton keyName="Escape" label="B" className="absolute right-16 bottom-0" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        <ActionButton keyName="Shift" label="Y" className="absolute right-16 top-0" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
        <ActionButton keyName="Escape" label="X" className="absolute right-32 top-1/2 -translate-y-1/2" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
      </div>
    </div>
  );
}

function PadButton({ keyName, className, onKeyDown, onKeyUp }: { keyName: string, className: string, onKeyDown: any, onKeyUp: any }) {
  const handleStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onKeyDown(keyName);
  };
  const handleEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onKeyUp(keyName);
  };

  return (
    <div 
      className={`bg-white/30 active:bg-white/60 transition-colors ${className}`}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    />
  );
}

function ActionButton({ keyName, label, className, onKeyDown, onKeyUp }: { keyName: string, label: string, className: string, onKeyDown: any, onKeyUp: any }) {
  const handleStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onKeyDown(keyName);
  };
  const handleEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onKeyUp(keyName);
  };

  return (
    <div 
      className={`w-14 h-14 rounded-full bg-white/30 active:bg-white/60 flex items-center justify-center text-white font-bold text-xl transition-colors ${className}`}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {label}
    </div>
  );
}

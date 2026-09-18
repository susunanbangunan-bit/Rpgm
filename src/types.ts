export type EngineId = 'mv' | 'mz' | 'xp' | 'vx' | 'vxace' | 'unknown';

export interface EngineCapabilities {
  html5: boolean;
  native: boolean;
  touchInput: boolean;
  keyboardInput: boolean;
  saveStates: boolean;
}

export interface GameEngineAdapter {
  id: EngineId;
  name: string;
  version: string;
  capabilities: EngineCapabilities;
  
  detect(files: string[]): number; // returns confidence 0-100
  launch(game: Game, container: HTMLElement): Promise<void>;
  stop(game: Game): Promise<void>;
  pause(game: Game): Promise<void>;
  resume(game: Game): Promise<void>;
}

export interface GameMetadata {
  id: string;
  name: string;
  path: string;
  engine: EngineId;
  engineVersion?: string;
  sizeBytes: number;
  iconUrl?: string;
  addedAt: number;
  lastPlayed?: number;
  playTimeSeconds: number;
}

export interface GameConfig {
  resolution: 'auto' | 'original' | 'fit';
  pixelPerfect: boolean;
  showFps: boolean;
  touchControls: boolean;
}

export interface Game extends GameMetadata {
  config: GameConfig;
}

export interface GameError {
  engine: EngineId;
  message: string;
  causes: string[];
}

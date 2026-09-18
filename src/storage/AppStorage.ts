import { EngineId, GameMetadata, GameConfig, Game } from '../types';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AppStorageSchema extends DBSchema {
  games: {
    key: string;
    value: Game;
  };
  settings: {
    key: string;
    value: any;
  };
}

class AppStorageImpl {
  private dbPromise: Promise<IDBPDatabase<AppStorageSchema>>;

  constructor() {
    this.dbPromise = openDB<AppStorageSchema>('rpgm-player-storage', 1, {
      upgrade(db) {
        db.createObjectStore('games', { keyPath: 'id' });
        db.createObjectStore('settings');
      },
    });
  }

  async addGame(game: Game) {
    const db = await this.dbPromise;
    await db.put('games', game);
  }

  async getGame(id: string): Promise<Game | undefined> {
    const db = await this.dbPromise;
    return await db.get('games', id);
  }

  async getAllGames(): Promise<Game[]> {
    const db = await this.dbPromise;
    return await db.getAll('games');
  }

  async removeGame(id: string) {
    const db = await this.dbPromise;
    await db.delete('games', id);
  }

  async updateGameConfig(id: string, config: Partial<GameConfig>) {
    const db = await this.dbPromise;
    const game = await db.get('games', id);
    if (game) {
      game.config = { ...game.config, ...config };
      await db.put('games', game);
    }
  }
}

export const AppStorage = new AppStorageImpl();

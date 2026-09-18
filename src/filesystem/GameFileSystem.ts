import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GameFSSchema extends DBSchema {
  files: {
    key: [string, string]; // [gameId, filePath]
    value: {
      gameId: string;
      filePath: string;
      data: Blob;
      mimeType: string;
    };
    indexes: {
      'by-game': string;
    };
  };
}

class GameFileSystemImpl {
  private dbPromise: Promise<IDBPDatabase<GameFSSchema>>;

  constructor() {
    this.dbPromise = openDB<GameFSSchema>('game-fs', 1, {
      upgrade(db) {
        const store = db.createObjectStore('files', { keyPath: ['gameId', 'filePath'] });
        store.createIndex('by-game', 'gameId');
      },
    });
  }

  async writeFile(gameId: string, filePath: string, data: Blob, mimeType: string = 'application/octet-stream') {
    const db = await this.dbPromise;
    await db.put('files', {
      gameId,
      filePath: this.normalizePath(filePath),
      data,
      mimeType,
    });
  }

  async writeFiles(files: { gameId: string, filePath: string, data: Blob, mimeType: string }[]) {
    const db = await this.dbPromise;
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    for (const f of files) {
      store.put({
        gameId: f.gameId,
        filePath: this.normalizePath(f.filePath),
        data: f.data,
        mimeType: f.mimeType,
      });
    }
    await tx.done;
  }

  async readFile(gameId: string, filePath: string): Promise<Blob | null> {
    const db = await this.dbPromise;
    const file = await db.get('files', [gameId, this.normalizePath(filePath)]);
    return file ? file.data : null;
  }

  async exists(gameId: string, filePath: string): Promise<boolean> {
    const db = await this.dbPromise;
    const key = await db.getKey('files', [gameId, this.normalizePath(filePath)]);
    return !!key;
  }

  async listFiles(gameId: string): Promise<string[]> {
    const db = await this.dbPromise;
    const files = await db.getAllFromIndex('files', 'by-game', gameId);
    return files.map(f => f.filePath);
  }

  async deleteGameFiles(gameId: string) {
    const db = await this.dbPromise;
    const tx = db.transaction('files', 'readwrite');
    const index = tx.store.index('by-game');
    let cursor = await index.openCursor(gameId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  private normalizePath(path: string): string {
    let normalized = path.replace(/\\/g, '/');
    if (normalized.startsWith('/')) normalized = normalized.substring(1);
    return normalized;
  }
}

export const GameFileSystem = new GameFileSystemImpl();

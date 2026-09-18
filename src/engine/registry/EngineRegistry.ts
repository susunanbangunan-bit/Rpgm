import { GameEngineAdapter, EngineId } from '../../types';
import { MVAdapter } from '../adapters/mv/MVAdapter';
import { MZAdapter } from '../adapters/mz/MZAdapter';

class EngineRegistryImpl {
  private adapters: Map<EngineId, GameEngineAdapter> = new Map();

  constructor() {
    this.register(new MVAdapter());
    this.register(new MZAdapter());
  }

  register(adapter: GameEngineAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(id: EngineId): GameEngineAdapter | undefined {
    return this.adapters.get(id);
  }

  getAllAdapters(): GameEngineAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const EngineRegistry = new EngineRegistryImpl();

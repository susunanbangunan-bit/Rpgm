import { create } from 'zustand';
import { Game } from '../types';
import { AppStorage } from '../storage/AppStorage';

interface AppState {
  games: Game[];
  activeGame: Game | null;
  isLoading: boolean;
  loadGames: () => Promise<void>;
  addGame: (game: Game) => Promise<void>;
  removeGame: (id: string) => Promise<void>;
  setActiveGame: (game: Game | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  games: [],
  activeGame: null,
  isLoading: true,
  loadGames: async () => {
    set({ isLoading: true });
    const games = await AppStorage.getAllGames();
    set({ games, isLoading: false });
  },
  addGame: async (game) => {
    await AppStorage.addGame(game);
    set((state) => ({ games: [...state.games, game] }));
  },
  removeGame: async (id) => {
    await AppStorage.removeGame(id);
    set((state) => ({ games: state.games.filter(g => g.id !== id) }));
  },
  setActiveGame: (game) => set({ activeGame: game }),
}));

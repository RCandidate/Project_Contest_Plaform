import { create } from 'zustand';

type AuthModalMode = 'login' | 'register';

interface UiState {
  authModal: AuthModalMode | null;
  openAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  authModal: null,
  openAuthModal: (mode) => set({ authModal: mode }),
  closeAuthModal: () => set({ authModal: null }),
}));

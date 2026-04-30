import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  signIn: () => void;
  signOut: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  signIn: () => set({ isAuthenticated: true }),
  signOut: () => set({ isAuthenticated: false, hasCompletedOnboarding: false }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));

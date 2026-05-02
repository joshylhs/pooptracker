import { create } from 'zustand';
import {
  FirebaseUser,
  LogInInput,
  SignUpInput,
  logIn as logInService,
  logOut as logOutService,
  signUp as signUpService,
  subscribeToAuthState,
} from '../services/auth';

interface AuthState {
  user: FirebaseUser | null;
  isInitialised: boolean;
  hasCompletedOnboarding: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  logIn: (input: LogInInput) => Promise<void>;
  logOut: () => Promise<void>;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isInitialised: false,
  hasCompletedOnboarding: false,

  signUp: async input => {
    await signUpService(input);
    // The auth listener will set `user`. We just mark this as a fresh signup
    // so the user lands on Onboarding rather than skipping straight to AppTabs.
    set({ hasCompletedOnboarding: false });
  },

  logIn: async input => {
    await logInService(input);
    // Returning users skip onboarding.
    set({ hasCompletedOnboarding: true });
  },

  logOut: async () => {
    await logOutService();
    set({ hasCompletedOnboarding: false });
  },

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));

let unsubscribe: (() => void) | null = null;

export function startAuthListener(): void {
  if (unsubscribe) return;
  unsubscribe = subscribeToAuthState(user => {
    useAuthStore.setState(state => ({
      user,
      isInitialised: true,
      // If a session is restored on app launch (user !== null and we're moving
      // from un-initialised to initialised), assume onboarding was already done.
      hasCompletedOnboarding:
        user !== null && !state.isInitialised ? true : state.hasCompletedOnboarding,
    }));
  });
}

export function stopAuthListener(): void {
  unsubscribe?.();
  unsubscribe = null;
}

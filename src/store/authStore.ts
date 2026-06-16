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
import { useLogStore } from './logStore';
import { useFriendsStore } from './friendsStore';
import { registerFcmToken } from '../services/pokes';
import { checkAndAwardBadges } from '../services/badgeService';

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
  },

  logIn: async input => {
    await logInService(input);
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
    const previousUid = useAuthStore.getState().user?.uid ?? null;
    const nextUid = user?.uid ?? null;
    if (previousUid !== nextUid) {
      useLogStore.getState().clear();
      useFriendsStore.getState().clear();
      if (user?.uid) {
        void registerFcmToken(user.uid);
        void checkAndAwardBadges(user.uid);
      }
    }
    useAuthStore.setState(state => ({
      user,
      isInitialised: true,
      // Restored session (app relaunch with existing Firebase session) means
      // onboarding was completed — Firebase account only exists post-onboarding.
      hasCompletedOnboarding:
        user !== null && !state.isInitialised ? true : state.hasCompletedOnboarding,
    }));
  });
}

export function stopAuthListener(): void {
  unsubscribe?.();
  unsubscribe = null;
}

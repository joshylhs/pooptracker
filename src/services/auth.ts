import {
  FirebaseAuthTypes,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from '@react-native-firebase/auth';
import { auth } from './firebase';

export type FirebaseUser = FirebaseAuthTypes.User;

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LogInInput {
  email: string;
  password: string;
}

export async function signUp({
  email,
  password,
  displayName,
}: SignUpInput): Promise<FirebaseUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

export async function logIn({ email, password }: LogInInput): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

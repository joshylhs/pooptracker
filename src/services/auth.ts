import {
  EmailAuthProvider,
  FirebaseAuthTypes,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
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

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function reauthenticateUser(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw new Error('Not authenticated');
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await deleteUser(user);
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

import {
  EmailAuthProvider,
  FirebaseAuthTypes,
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
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

export async function checkEmailExists(email: string): Promise<boolean> {
  const methods = await fetchSignInMethodsForEmail(auth, email.trim());
  return methods.length > 0;
}

export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await deleteUser(user);
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // wrong credentials — intentionally identical so neither reveals which part is wrong
  'auth/invalid-credential':     'Incorrect email or password!',
  'auth/wrong-password':         'Incorrect email or password!',
  'auth/user-not-found':         'Incorrect email or password!',
  // signup-specific
  'auth/email-already-in-use':   'An account with this email already exists!',
  'auth/weak-password':          'Choose a longer or more complex password!',
  'auth/invalid-email':          'Enter a valid email address!',
  // account state
  'auth/user-disabled':          'This account has been suspended, contact support if you think this is a mistake.',
  // rate limiting / connectivity
  'auth/too-many-requests':      'Too many failed attempts, wait a few minutes or reset your password!',
  'auth/network-request-failed': 'No internet connection, check your connection and try again!',
  // auth/operation-not-allowed is a developer misconfiguration, not user-facing — let it fall through to the generic message
};

export function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string }).code ?? '';
  return AUTH_ERROR_MESSAGES[code] ?? 'Something went wrong, try again!';
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

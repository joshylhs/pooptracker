import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { useAuthStore } from '../store/authStore';
import { incrementPokesSent, checkAndAwardBadges } from './badgeService';

export async function registerFcmToken(uid: string): Promise<void> {
  try {
    const messaging = getMessaging(getApp());
    const status = await requestPermission(messaging);
    if (
      status !== AuthorizationStatus.AUTHORIZED &&
      status !== AuthorizationStatus.PROVISIONAL
    ) {
      return;
    }
    const token = await getToken(messaging);
    const db = getFirestore(getApp());
    await setDoc(
      doc(db, 'users', uid),
      { fcmToken: token },
      { merge: true },
    );
  } catch (e) {
    // Silently fail — pokes won't work but the rest of the app is unaffected
    console.warn('FCM token registration failed:', e);
  }
}

export async function sendPoke(recipientId: string, message?: string): Promise<void> {
  const fn = httpsCallable(getFunctions(getApp(), 'asia-southeast1'), 'sendPoke');
  await fn({ recipientId, message });
  const uid = useAuthStore.getState().user?.uid;
  if (uid) {
    void incrementPokesSent(uid).then(() => checkAndAwardBadges(uid));
  }
}

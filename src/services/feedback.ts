import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getApp } from '@react-native-firebase/app';

export interface FeedbackPayload {
  type: 'deletion' | 'general';
  topic?: string;
  freeText?: string;
  username?: string;
  email?: string;
  platform?: string;
  deviceModel?: string;
  appVersion?: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  const fn = httpsCallable(getFunctions(getApp(), 'asia-southeast1'), 'submitFeedback');
  await fn(payload);
}

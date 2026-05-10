import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

// @react-native-firebase reads native config (GoogleService-Info.plist on iOS,
// google-services.json on Android). FirebaseApp.configure() is called in
// AppDelegate before this module is touched.
const app = getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };

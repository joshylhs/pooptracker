/**
 * @format
 */

// Polyfill globalThis.crypto.getRandomValues with the platform secure random
// source (SecRandomCopyBytes on iOS, SecureRandom on Android). Firebase and
// other libs may rely on it; safer to install before any other import.
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

/**
 * @format
 */

// Must be the very first import — installs globalThis.crypto.getRandomValues
// using the platform secure random source (SecRandomCopyBytes on iOS,
// SecureRandom on Android). libsodium-wrappers refuses to load without it.
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

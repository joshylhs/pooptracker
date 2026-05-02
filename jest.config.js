module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-.*|@notifee|@invertase|expo-modules-core|expo-sqlite|firebase|@firebase|@react-native-async-storage)/)',
  ],
};

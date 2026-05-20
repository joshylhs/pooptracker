import { useEffect } from 'react';
import { LogBox, StatusBar, StyleSheet } from 'react-native';

LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered.']);
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { startAuthListener, stopAuthListener } from './src/store/authStore';

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#2b2928',
    card: '#2b2928',
    text: '#F5EFE6',
    border: '#4A4239',
    primary: '#7F77DD',
    notification: '#7F77DD',
  },
};

function App() {
  useEffect(() => {
    startAuthListener();
    return stopAuthListener;
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer theme={AppTheme}>
          {/* Our theme is always warm dark brown, so light-content (white icons)
              is the only correct choice regardless of system colour scheme. */}
          <StatusBar barStyle="light-content" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;

import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, useAppDispatch } from './src/store';
import { loadTasks } from './src/store/taskSlice';
import { loadOutbox } from './src/store/syncSlice';
import { loadSettings } from './src/store/settingsSlice';
import { ThemeProvider, useTheme } from './src/theme';
import { Navigation } from './src/navigation';

// component that loads persisted data on mount
function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // load all persisted data from MMKV
    dispatch(loadSettings());
    dispatch(loadTasks());
    dispatch(loadOutbox());
  }, [dispatch]);

  return <>{children}</>;
}

// inner app with theme-aware status bar
function ThemedApp() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Navigation />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <AppInitializer>
              <ThemedApp />
            </AppInitializer>
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

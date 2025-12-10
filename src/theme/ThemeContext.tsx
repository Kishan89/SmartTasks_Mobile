import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { colors, ColorScheme } from './colors';
import { getJson, setJson, STORAGE_KEYS } from '../storage';
import { AppSettings } from '../types';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  colors: ColorScheme;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  // load persisted theme on mount
  useEffect(() => {
    const settings = getJson<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
    if (settings.theme) {
      setThemeState(settings.theme);
    } else {
      setThemeState(systemScheme);
    }
  }, [systemScheme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    const settings = getJson<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
    setJson(STORAGE_KEYS.SETTINGS, { ...settings, theme: newTheme });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextValue = {
    theme,
    colors: colors[theme],
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

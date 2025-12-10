import AsyncStorage from '@react-native-async-storage/async-storage';

// storage keys
export const STORAGE_KEYS = {
  TASKS: 'tasks',
  OUTBOX: 'outbox',
  SETTINGS: 'settings',
  LAST_SYNC: 'lastSync',
  SERVER_TASKS: 'serverTasks',
} as const;

// typed helpers for common operations
export async function getJson<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) return defaultValue;
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
}

export async function getServerJson<T>(key: string, defaultValue: T): Promise<T> {
  return getJson(`server_${key}`, defaultValue);
}

export async function setServerJson<T>(key: string, value: T): Promise<void> {
  return setJson(`server_${key}`, value);
}

export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter(k => !k.startsWith('server_'));
    await AsyncStorage.multiRemove(appKeys);
  } catch (error) {
    console.error('Clear data error:', error);
  }
}

export async function clearServerData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const serverKeys = keys.filter(k => k.startsWith('server_'));
    await AsyncStorage.multiRemove(serverKeys);
  } catch (error) {
    console.error('Clear server data error:', error);
  }
}

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { useTheme } from '../theme';
import { useAppSelector, useAppDispatch } from '../store';
import { selectSettings, toggleNetwork, updateSettings } from '../store/settingsSlice';
import { seedDemoData, clearAllTasks } from '../store/taskSlice';
import { clearOutbox, setSyncStatus } from '../store/syncSlice';
import { clearAllData, clearServerData } from '../storage';
import { startSync } from '../sync';

export function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);

  const handleNetworkToggle = () => {
    dispatch(toggleNetwork());
    // if turning on, trigger sync
    if (!settings.simulateNetwork) {
      setTimeout(() => startSync(), 100);
    } else {
      dispatch(setSyncStatus('offline'));
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all tasks and reset the app. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch(clearAllTasks());
            dispatch(clearOutbox());
            clearAllData();
            clearServerData();
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleSeedData = () => {
    dispatch(seedDemoData());
    Alert.alert('Demo Data Added', '5 sample tasks have been added.');
  };

  const handleForceSync = () => {
    if (!settings.simulateNetwork) {
      Alert.alert('Offline', 'Enable network simulation first to sync.');
      return;
    }
    startSync();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      {/* network simulation */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync & Network</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Simulate Network</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Toggle to simulate going online/offline
            </Text>
          </View>
          <Switch
            value={settings.simulateNetwork}
            onValueChange={handleNetworkToggle}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={settings.simulateNetwork ? colors.primary : colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleForceSync}
        >
          <Text style={styles.buttonText}>🔄 Force Sync Now</Text>
        </TouchableOpacity>
      </View>

      {/* appearance */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Switch between light and dark theme
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={theme === 'dark' ? colors.primary : colors.textMuted}
          />
        </View>
      </View>

      {/* data management */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSeedData}
        >
          <Text style={styles.buttonText}>🌱 Seed Demo Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton, { backgroundColor: colors.error }]}
          onPress={handleClearData}
        >
          <Text style={styles.buttonText}>🗑️ Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* about */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          An offline-first task manager with simulated sync
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  dangerButton: {
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

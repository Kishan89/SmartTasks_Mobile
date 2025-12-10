import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { SyncStatus } from '../types';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  outboxCount: number;
}

export function SyncStatusBadge({ status, outboxCount }: SyncStatusBadgeProps) {
  const { colors } = useTheme();

  const config = {
    synced: { emoji: '✓', label: 'Synced', color: colors.success },
    syncing: { emoji: '⟳', label: 'Syncing', color: colors.primary },
    offline: { emoji: '⚠', label: 'Offline', color: colors.warning },
    error: { emoji: '✕', label: 'Error', color: colors.error },
  }[status];

  return (
    <View style={[styles.container, { backgroundColor: config.color + '15' }]}>
      <Text style={[styles.emoji, { color: config.color }]}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
        {outboxCount > 0 && ` (${outboxCount})`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  emoji: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

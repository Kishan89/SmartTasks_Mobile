import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { useAppSelector } from '../store';
import { selectTaskStats } from '../store/taskSlice';
import { selectSyncStatus, selectLastSyncTime, selectOutboxCount } from '../store/syncSlice';
import { SimpleBarChart, SyncStatusBadge } from '../components';
import { formatRelativeTime } from '../utils';

export function AnalyticsScreen() {
  const { colors } = useTheme();
  const stats = useAppSelector(selectTaskStats);
  const syncStatus = useAppSelector(selectSyncStatus);
  const lastSyncTime = useAppSelector(selectLastSyncTime);
  const outboxCount = useAppSelector(selectOutboxCount);

  const statusData = [
    { label: 'Pending', value: stats.pending, color: colors.statusPending },
    { label: 'In Progress', value: stats.inProgress, color: colors.statusInProgress },
    { label: 'Completed', value: stats.completed, color: colors.statusCompleted },
  ];

  const priorityData = [
    { label: 'Low', value: stats.lowPriority, color: colors.priorityLow },
    { label: 'Medium', value: stats.mediumPriority, color: colors.priorityMedium },
    { label: 'High', value: stats.highPriority, color: colors.priorityHigh },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
      </View>

      {/* sync status card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.syncHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Sync Status</Text>
          <SyncStatusBadge status={syncStatus} outboxCount={outboxCount} />
        </View>
        <Text style={[styles.syncInfo, { color: colors.textSecondary }]}>
          {lastSyncTime ? `Last synced: ${formatRelativeTime(lastSyncTime)}` : 'Never synced'}
        </Text>
        {outboxCount > 0 && (
          <Text style={[styles.syncInfo, { color: colors.warning }]}>
            {outboxCount} change{outboxCount > 1 ? 's' : ''} pending sync
          </Text>
        )}
      </View>

      {/* total tasks - centered */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Total Tasks</Text>
        <Text style={[styles.bigNumber, { color: colors.primary }]}>{stats.total}</Text>
      </View>

      {/* status breakdown */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SimpleBarChart data={statusData} title="By Status" height={140} />
      </View>

      {/* priority breakdown */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SimpleBarChart data={priorityData} title="By Priority" height={140} />
      </View>

      {/* summary stats - grid layout */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.statValue, { color: colors.statusCompleted }]}>
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completion</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.statValue, { color: colors.priorityHigh }]}>
              {stats.highPriority}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>High Priority</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.statValue, { color: colors.statusInProgress }]}>
              {stats.inProgress}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</Text>
          </View>
        </View>
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
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  bigNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
});

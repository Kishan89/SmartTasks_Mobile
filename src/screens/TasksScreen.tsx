import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useAppSelector, useAppDispatch } from '../store';
import { selectFilteredTasks, setFilter, updateTask, deleteTask } from '../store/taskSlice';
import { selectSyncStatus, selectOutboxCount } from '../store/syncSlice';
import { selectIsOnline } from '../store/settingsSlice';
import { TaskListItem, SyncStatusBadge, FilterBar, EmptyState } from '../components';
import { startSync } from '../sync';
import { TaskStatus, TaskPriority } from '../types';

type RootStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string };
  AddEditTask: { taskId?: string };
};

export function TasksScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(selectFilteredTasks);
  const filters = useAppSelector((state) => state.tasks.filters);
  const syncStatus = useAppSelector(selectSyncStatus);
  const outboxCount = useAppSelector(selectOutboxCount);
  const isOnline = useAppSelector(selectIsOnline);

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    startSync();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    dispatch(updateTask({ id: taskId, updates: { status } }));
  };

  const handleDelete = (taskId: string) => {
    dispatch(deleteTask(taskId));
  };

  const renderEmptyState = () => {
    if (filters.search || filters.status !== 'all' || filters.priority !== 'all') {
      return (
        <EmptyState
          icon="🔍"
          title="No matching tasks"
          message="Try adjusting your search or filters"
        />
      );
    }
    return (
      <EmptyState
        icon="✨"
        title="No tasks yet"
        message="Tap the + button to create your first task"
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* header with sync status */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
          <SyncStatusBadge status={syncStatus} outboxCount={outboxCount} />
        </View>

        {/* search bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textMuted}
            value={filters.search}
            onChangeText={(text) => dispatch(setFilter({ search: text }))}
          />
          {filters.search ? (
            <TouchableOpacity onPress={() => dispatch(setFilter({ search: '' }))}>
              <Text style={[styles.clearButton, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* filter toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={[styles.filterToggleText, { color: colors.primary }]}>
            {showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}
          </Text>
        </TouchableOpacity>

        {showFilters && (
          <FilterBar
            statusFilter={filters.status}
            priorityFilter={filters.priority}
            onStatusChange={(status) => dispatch(setFilter({ status }))}
            onPriorityChange={(priority) => dispatch(setFilter({ priority }))}
          />
        )}
      </View>

      {/* task list */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskListItem
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onStatusChange={(status) => handleStatusChange(item.id, status)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* FAB for adding tasks */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddEditTask', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    fontSize: 16,
    padding: 4,
  },
  filterToggle: {
    marginTop: 12,
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Task, TaskStatus } from '../types';
import { useTheme } from '../theme';
import { formatDate, isOverdue } from '../utils';

interface TaskListItemProps {
  task: Task;
  onPress: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}

export function TaskListItem({ task, onPress, onStatusChange, onDelete }: TaskListItemProps) {
  const { colors } = useTheme();

  const handleComplete = () => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(newStatus);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  // Right swipe action - Complete
  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.swipeAction, { backgroundColor: colors.swipeComplete }]}
      onPress={handleComplete}
    >
      <Text style={styles.swipeText}>
        {task.status === 'completed' ? '↩️\nUndo' : '✓\nComplete'}
      </Text>
    </TouchableOpacity>
  );

  // Left swipe action - Delete
  const renderLeftActions = () => (
    <TouchableOpacity
      style={[styles.swipeAction, { backgroundColor: colors.swipeDelete }]}
      onPress={handleDelete}
    >
      <Text style={styles.swipeText}>🗑️Delete</Text>
    </TouchableOpacity>
  );

  const priorityColor = {
    low: colors.priorityLow,
    medium: colors.priorityMedium,
    high: colors.priorityHigh,
  }[task.priority];

  const statusColor = {
    pending: colors.statusPending,
    in_progress: colors.statusInProgress,
    completed: colors.statusCompleted,
  }[task.status];

  const isTaskOverdue = task.dueDate && task.status !== 'completed' && isOverdue(task.dueDate);

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: colors.surface, borderLeftColor: priorityColor },
          task.status === 'completed' && styles.completedTask,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Status indicator */}
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              task.status === 'completed' && styles.completedText,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {task.description}
            </Text>
          ) : null}

          {/* Meta info */}
          <View style={styles.meta}>
            {/* Priority badge */}
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>

            {/* Due date */}
            {task.dueDate && (
              <Text
                style={[
                  styles.dueDate,
                  { color: isTaskOverdue ? colors.error : colors.textMuted },
                ]}
              >
                {isTaskOverdue ? '⚠️ ' : '📅 '}
                {formatDate(task.dueDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {task.status === 'in_progress' ? 'IN PROGRESS' : task.status.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    // Matte shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 6,
    borderRadius: 12,
  },
  swipeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
});

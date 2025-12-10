import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useAppSelector, useAppDispatch } from '../store';
import { updateTask, deleteTask } from '../store/taskSlice';
import { Task, TaskStatus } from '../types';
import { formatDate, formatDateTime } from '../utils';
import { queueChange } from '../sync';

type RootStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string };
  AddEditTask: { taskId?: string };
};

export function TaskDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const dispatch = useAppDispatch();

  const task = useAppSelector((state) =>
    state.tasks.tasks.find((t) => t.id === route.params.taskId)
  );

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Task not found</Text>
      </View>
    );
  }

  const handleStatusChange = (status: TaskStatus) => {
    dispatch(updateTask({ id: task.id, updates: { status } }));
    queueChange('update', task.id, { status, updatedAt: new Date().toISOString() });
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(deleteTask(task.id));
          queueChange('delete', task.id, null);
          navigation.goBack();
        },
      },
    ]);
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return colors.priorityHigh;
      case 'medium':
        return colors.priorityMedium;
      case 'low':
        return colors.priorityLow;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return colors.statusCompleted;
      case 'in_progress':
        return colors.statusInProgress;
      case 'pending':
        return colors.statusPending;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* header with priority */}
        <View style={styles.header}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
              {task.priority.toUpperCase()} PRIORITY
            </Text>
          </View>
        </View>

        {/* title */}
        <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>

        {/* description */}
        {task.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {task.description}
          </Text>
        ) : (
          <Text style={[styles.noDescription, { color: colors.textMuted }]}>No description</Text>
        )}

        {/* status */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Status</Text>
          <View style={styles.statusButtons}>
            {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  {
                    backgroundColor:
                      task.status === status ? getStatusColor() + '20' : colors.surfaceSecondary,
                    borderColor: task.status === status ? getStatusColor() : colors.border,
                  },
                ]}
                onPress={() => handleStatusChange(status)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    { color: task.status === status ? getStatusColor() : colors.textSecondary },
                  ]}
                >
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* due date */}
        {task.dueDate && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Due Date</Text>
            <Text style={[styles.dateText, { color: colors.text }]}>
              📅 {formatDate(task.dueDate)}
            </Text>
          </View>
        )}

        {/* timestamps */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Created</Text>
          <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
            {formatDateTime(task.createdAt)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Last Updated</Text>
          <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
            {formatDateTime(task.updatedAt)}
          </Text>
        </View>
      </View>

      {/* action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddEditTask', { taskId: task.id })}
        >
          <Text style={styles.actionButtonText}>✏️ Edit Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>🗑️ Delete Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  header: {
    marginBottom: 12,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  noDescription: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 16,
  },
  timestampText: {
    fontSize: 14,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

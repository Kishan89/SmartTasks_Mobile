import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useAppSelector, useAppDispatch } from '../store';
import { addTask, updateTask } from '../store/taskSlice';
import { TaskStatus, TaskPriority, Task } from '../types';
import { queueChange } from '../sync';
import { v4 as uuid } from 'uuid';

type RootStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string };
  AddEditTask: { taskId?: string };
};

export function AddEditTaskScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddEditTask'>>();
  const dispatch = useAppDispatch();

  const existingTask = useAppSelector((state) =>
    route.params?.taskId ? state.tasks.tasks.find((t) => t.id === route.params.taskId) : null
  );

  const isEditing = !!existingTask;

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [status, setStatus] = useState<TaskStatus>(existingTask?.status || 'pending');
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(existingTask?.dueDate || '');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = () => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const now = new Date().toISOString();

    if (isEditing && existingTask) {
      const updates: Partial<Task> = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || undefined,
        updatedAt: now,
      };
      dispatch(updateTask({ id: existingTask.id, updates }));
      queueChange('update', existingTask.id, updates);
    } else {
      const newTask: Task = {
        id: uuid(),
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || undefined,
        createdAt: now,
        updatedAt: now,
      };
      dispatch(addTask({ title: newTask.title, description: newTask.description, status, priority, dueDate: newTask.dueDate }));
      queueChange('create', newTask.id, newTask);
    }

    navigation.goBack();
  };

  // simple date input - just a text field for ISO date
  const handleDateChange = (text: string) => {
    setDueDate(text);
  };

  const formatDateForDisplay = (isoString: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.form, { backgroundColor: colors.surface }]}>
        {/* title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                color: colors.text,
                borderColor: errors.title ? colors.error : colors.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor={colors.textMuted}
          />
          {errors.title && <Text style={[styles.error, { color: colors.error }]}>{errors.title}</Text>}
        </View>

        {/* description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description (optional)"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* status */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Status</Text>
          <View style={styles.options}>
            {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.option,
                  {
                    backgroundColor: status === opt ? colors.primary + '20' : colors.surfaceSecondary,
                    borderColor: status === opt ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setStatus(opt)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: status === opt ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {opt.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* priority */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
          <View style={styles.options}>
            {(['low', 'medium', 'high'] as TaskPriority[]).map((opt) => {
              const priorityColors = {
                low: colors.priorityLow,
                medium: colors.priorityMedium,
                high: colors.priorityHigh,
              };
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.option,
                    {
                      backgroundColor: priority === opt ? priorityColors[opt] + '20' : colors.surfaceSecondary,
                      borderColor: priority === opt ? priorityColors[opt] : colors.border,
                    },
                  ]}
                  onPress={() => setPriority(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: priority === opt ? priorityColors[opt] : colors.textSecondary },
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* due date - simple text input for now */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Due Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border },
            ]}
            value={dueDate ? dueDate.split('T')[0] : ''}
            onChangeText={(text) => setDueDate(text ? `${text}T23:59:59.000Z` : '')}
            placeholder="2025-12-31"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* save button */}
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Create Task'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

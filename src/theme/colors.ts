// Modern high-contrast color palettes
export const colors = {
  light: {
    primary: '#6366F1',        // Indigo
    primaryLight: '#818CF8',
    background: '#FFFFFF',     // Pure white
    surface: '#F8FAFC',        // Very light gray
    surfaceSecondary: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    // priority colors
    priorityLow: '#06B6D4',
    priorityMedium: '#F59E0B',
    priorityHigh: '#EF4444',
    // status colors
    statusPending: '#64748B',
    statusInProgress: '#3B82F6',
    statusCompleted: '#10B981',
    // swipe action colors
    swipeComplete: '#10B981',
    swipeDelete: '#EF4444',
  },
  dark: {
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    background: '#000000',     // Pure black
    surface: '#0F172A',        // Very dark slate
    surfaceSecondary: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#1E293B',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    // priority colors
    priorityLow: '#22D3EE',
    priorityMedium: '#FBBF24',
    priorityHigh: '#F87171',
    // status colors
    statusPending: '#94A3B8',
    statusInProgress: '#60A5FA',
    statusCompleted: '#34D399',
    // swipe action colors
    swipeComplete: '#34D399',
    swipeDelete: '#F87171',
  },
};

export type ColorScheme = typeof colors.light;

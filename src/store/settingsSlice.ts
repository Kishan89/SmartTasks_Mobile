import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../types';
import { getJson, setJson, STORAGE_KEYS } from '../storage';

const defaultSettings: AppSettings = {
  theme: 'light',
  simulateNetwork: false,
  apiMode: 'simulated',
  simulatedLatencyMs: 500,
  simulatedFailureRate: 0.2,
};

interface SettingsState {
  settings: AppSettings;
}

const initialState: SettingsState = {
  settings: defaultSettings,
};

// async thunk to load settings from storage
export const loadSettings = createAsyncThunk('settings/loadSettings', async () => {
  const stored = await getJson<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, {});
  return { ...defaultSettings, ...stored };
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
      setJson(STORAGE_KEYS.SETTINGS, state.settings);
    },

    toggleNetwork(state) {
      state.settings.simulateNetwork = !state.settings.simulateNetwork;
      setJson(STORAGE_KEYS.SETTINGS, state.settings);
    },

    resetSettings(state) {
      state.settings = defaultSettings;
      setJson(STORAGE_KEYS.SETTINGS, defaultSettings);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.settings = action.payload;
    });
  },
});

export const { updateSettings, toggleNetwork, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer;

// selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings.settings;
export const selectIsOnline = (state: { settings: SettingsState }) =>
  state.settings.settings.simulateNetwork;

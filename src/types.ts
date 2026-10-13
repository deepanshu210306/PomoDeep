import type { AccentKey, AmbientEffect, BackgroundKey, LanguageKey } from './config/theme';

export type PanelId =
  | 'tasks'
  | 'achievements'
  | 'streak'
  | 'music'
  | 'settings'
  | 'studyHistory'
  | null;
export type TimerMode = 'focus' | 'short' | 'long';
export type AppView = 'pomodoro' | 'study';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';
export type TaskSort = 'newest' | 'oldest' | 'title' | 'status' | 'time';

/** dayKey (YYYY-MM-DD) → studied milliseconds */
export type StudyHistory = Record<string, number>;

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  accumulatedMs: number;
  focused?: boolean;
};

export type ThemeState = {
  accent: AccentKey;
  background: BackgroundKey;
  effect: AmbientEffect;
  language: LanguageKey;
  customBackground: string | null;
};

export type SettingsState = {
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  alarm: boolean;
  ambientEnabled: boolean;
  ambientVolume: number;
  selectedTrackId: string;
  notifications: boolean;
  dailyGoalMinutes: number;
};

export type PomodoroState = {
  mode: TimerMode;
  remainingMs: number;
  endsAt: number | null;
  isRunning: boolean;
  durations: { focus: number; short: number; long: number };
  counts: { focus: number; short: number; long: number };
  countsDay: string;
  cycle: number;
};

export type StopwatchState = {
  isRunning: boolean;
  startedAt: number | null;
  elapsedMs: number;
  dayKey: string;
  dailyTotalMs: number;
};

export type StudyTrackerState = {
  activeSince: number | null;
  dayKey: string;
  dailyMs: number;
};

export type StreakState = {
  current: number;
  best: number;
  lastActiveDay: string | null;
};

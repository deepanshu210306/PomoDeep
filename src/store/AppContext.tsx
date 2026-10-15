import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ACCENTS,
  DEFAULT_DURATIONS,
  isBackgroundKey,
} from '../config/theme';
import { AMBIENT_TRACKS } from '../config/tracks';
import {
  clearCustomMedia,
  CUSTOM_MEDIA_IDB_MARKER,
  dataUrlByteLength,
  loadCustomMedia,
  MAX_CUSTOM_MEDIA_BYTES,
  saveCustomMedia,
} from '../utils/customMedia';
import {
  loadJSON,
  loadRawJSON,
  mergeStudyHistory,
  pruneStudyHistory,
  saveJSON,
  todayKey,
} from '../utils/storage';
import { clamp } from '../utils/time';
import type {
  AppView,
  PanelId,
  PomodoroState,
  SettingsState,
  StopwatchState,
  StreakState,
  StudyHistory,
  StudyTrackerState,
  Task,
  TaskSort,
  TaskStatus,
  ThemeState,
  TimerMode,
} from '../types';

type AppContextValue = {
  theme: ThemeState;
  settings: SettingsState;
  pomodoro: PomodoroState;
  stopwatch: StopwatchState;
  study: StudyTrackerState;
  studyHistory: StudyHistory;
  studyLiveMs: number;
  streak: StreakState;
  tasks: Task[];
  panel: PanelId;
  view: AppView;
  focusTaskId: string | null;
  taskSearch: string;
  taskSort: TaskSort;
  taskFilter: TaskStatus | 'all';
  now: number;
  setPanel: (p: PanelId) => void;
  setView: (v: AppView) => void;
  updateTheme: (patch: Partial<ThemeState>) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  setDuration: (key: 'focus' | 'short' | 'long', seconds: number) => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  skipPomodoro: () => void;
  setPomodoroMode: (mode: TimerMode) => void;
  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resetStopwatch: () => void;
  addTask: (title: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setFocusTask: (id: string | null) => void;
  setTaskSearch: (q: string) => void;
  setTaskSort: (s: TaskSort) => void;
  setTaskFilter: (f: TaskStatus | 'all') => void;
  pomodoroDisplayMs: number;
  stopwatchDisplayMs: number;
  playAlarm: () => void;
  toast: string | null;
  setToast: (msg: string | null) => void;
  applyCloudData: (data: Record<string, unknown>) => void;
  getCloudSnapshot: () => Record<string, unknown>;
};

const AppContext = createContext<AppContextValue | null>(null);

const defaultTheme: ThemeState = {
  accent: 'rose',
  background: 'lofi',
  effect: 'motes',
  language: 'en',
  customBackground: null,
};

const defaultSettings: SettingsState = {
  autoStartBreaks: false,
  autoStartFocus: false,
  alarm: true,
  ambientEnabled: false,
  ambientVolume: 0.5,
  selectedTrackId: 'kyoto-rain',
  notifications: false,
  dailyGoalMinutes: 120,
};

function defaultPomodoro(): PomodoroState {
  return {
    mode: 'focus',
    remainingMs: DEFAULT_DURATIONS.focus * 1000,
    endsAt: null,
    isRunning: false,
    durations: {
      focus: DEFAULT_DURATIONS.focus,
      short: DEFAULT_DURATIONS.short,
      long: DEFAULT_DURATIONS.long,
    },
    counts: { focus: 0, short: 0, long: 0 },
    countsDay: todayKey(),
    cycle: 0,
  };
}

function defaultStopwatch(): StopwatchState {
  return {
    isRunning: false,
    startedAt: null,
    elapsedMs: 0,
    dayKey: todayKey(),
    dailyTotalMs: 0,
  };
}

function defaultStudy(): StudyTrackerState {
  return { activeSince: null, dayKey: todayKey(), dailyMs: 0 };
}

function defaultStreak(): StreakState {
  return { current: 0, best: 0, lastActiveDay: null };
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function rollDayIfNeeded<T extends { dayKey?: string; countsDay?: string }>(
  state: T,
  dayField: 'dayKey' | 'countsDay',
  onNewDay: (s: T) => T,
): T {
  const day = todayKey();
  const current = state[dayField];
  if (current !== day) return onNewDay({ ...state, [dayField]: day });
  return state;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(() => {
    const loaded = loadJSON('theme', defaultTheme);
    if (!isBackgroundKey(loaded.background)) {
      return { ...loaded, background: defaultTheme.background };
    }
    return loaded;
  });
  const [settings, setSettings] = useState<SettingsState>(() =>
    loadJSON('settings', defaultSettings),
  );
  const [pomodoro, setPomodoro] = useState<PomodoroState>(() => {
    const loaded = loadJSON('pomodoro', defaultPomodoro());
    return rollDayIfNeeded(loaded, 'countsDay', (s) => ({
      ...s,
      counts: { focus: 0, short: 0, long: 0 },
      countsDay: todayKey(),
    }));
  });
  const [stopwatch, setStopwatch] = useState<StopwatchState>(() => {
    const loaded = loadJSON('stopwatch', defaultStopwatch());
    return rollDayIfNeeded(loaded, 'dayKey', (s) => ({
      ...s,
      dayKey: todayKey(),
      dailyTotalMs: 0,
      elapsedMs: s.isRunning ? s.elapsedMs : 0,
      isRunning: false,
      startedAt: null,
    }));
  });
  const [study, setStudy] = useState<StudyTrackerState>(() => {
    const loaded = loadJSON('study', defaultStudy());
    return rollDayIfNeeded(loaded, 'dayKey', (s) => ({
      ...s,
      dayKey: todayKey(),
      dailyMs: 0,
      activeSince: null,
    }));
  });
  const [studyHistory, setStudyHistory] = useState<StudyHistory>(() => {
    const loaded = loadRawJSON<StudyHistory>('studyHistory', {});
    const studyLoaded = loadJSON('study', defaultStudy());
    const day = todayKey();
    let next: StudyHistory = { ...loaded };
    if (
      studyLoaded.dayKey &&
      studyLoaded.dayKey !== day &&
      studyLoaded.dailyMs > 0
    ) {
      next[studyLoaded.dayKey] = Math.max(
        next[studyLoaded.dayKey] || 0,
        studyLoaded.dailyMs,
      );
    }
    if (studyLoaded.dayKey === day) {
      next[day] = Math.max(next[day] || 0, studyLoaded.dailyMs);
    }
    return pruneStudyHistory(next);
  });
  const [streak, setStreak] = useState<StreakState>(() => loadJSON('streak', defaultStreak()));
  const [tasks, setTasks] = useState<Task[]>(() => loadRawJSON<Task[]>('tasks', []));
  const [panel, setPanel] = useState<PanelId>(null);
  const [view, setViewState] = useState<AppView>('pomodoro');
  const [focusTaskId, setFocusTaskId] = useState<string | null>(() =>
    loadRawJSON<string | null>('focusTaskId', null),
  );
  const [taskSearch, setTaskSearch] = useState('');
  const [taskSort, setTaskSort] = useState<TaskSort>('newest');
  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'all'>('all');
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<string | null>(null);

  const alarmRef = useRef<AudioContext | null>(null);
  const completingRef = useRef(false);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  // Tick clock
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Hydrate large custom media from IndexedDB (localStorage can't hold ~5MB)
  useEffect(() => {
    let cancelled = false;
    const markerOrMissing =
      !theme.customBackground ||
      theme.customBackground === CUSTOM_MEDIA_IDB_MARKER;
    if (!markerOrMissing) return;
    loadCustomMedia().then((media) => {
      if (cancelled || !media) return;
      setTheme((t) =>
        t.customBackground && t.customBackground !== CUSTOM_MEDIA_IDB_MARKER
          ? t
          : { ...t, customBackground: media },
      );
    });
    return () => {
      cancelled = true;
    };
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist theme; park large custom media in IndexedDB
  useEffect(() => {
    const slim = { ...theme };
    if (
      slim.customBackground &&
      slim.customBackground !== CUSTOM_MEDIA_IDB_MARKER &&
      slim.customBackground.length > 200_000
    ) {
      void saveCustomMedia(slim.customBackground);
      slim.customBackground = CUSTOM_MEDIA_IDB_MARKER;
    } else if (!slim.customBackground) {
      void clearCustomMedia();
    }
    saveJSON('theme', slim);
  }, [theme]);

  useEffect(() => saveJSON('settings', settings), [settings]);
  useEffect(() => saveJSON('pomodoro', pomodoro), [pomodoro]);
  useEffect(() => saveJSON('stopwatch', stopwatch), [stopwatch]);
  useEffect(() => saveJSON('study', study), [study]);
  useEffect(() => saveJSON('studyHistory', studyHistory), [studyHistory]);
  useEffect(() => saveJSON('streak', streak), [streak]);
  useEffect(() => saveJSON('tasks', tasks), [tasks]);
  useEffect(() => saveJSON('focusTaskId', focusTaskId), [focusTaskId]);

  const setView = useCallback((v: AppView) => {
    setViewState(v);
    if (v !== 'study') {
      setPanel((p) => (p === 'studyHistory' ? null : p));
    }
  }, []);

  // Keep today's history entry in sync with the study total
  useEffect(() => {
    setStudyHistory((prev) => {
      const day = study.dayKey;
      const ms = study.dailyMs;
      const nextMs = Math.max(prev[day] || 0, ms);
      if ((prev[day] || 0) === nextMs) return prev;
      return pruneStudyHistory({ ...prev, [day]: nextMs });
    });
  }, [study.dayKey, study.dailyMs]);

  // Apply accent CSS vars (gradient ring + UI)
  useEffect(() => {
    const base = ACCENTS[theme.accent];
    document.documentElement.style.setProperty('--accent', base);
    document.documentElement.style.setProperty(
      '--accent-soft',
      `color-mix(in srgb, ${base} 55%, white)`,
    );
    document.documentElement.style.setProperty(
      '--accent-deep',
      `color-mix(in srgb, ${base} 72%, #7f1d1d)`,
    );
    document.documentElement.setAttribute('data-accent', theme.accent);
  }, [theme.accent]);

  const playAlarm = useCallback(() => {
    if (!settings.alarm) return;
    try {
      const ctx = alarmRef.current ?? new AudioContext();
      alarmRef.current = ctx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      o.stop(ctx.currentTime + 0.85);
    } catch {
      // ignore
    }
    if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('PomoDeep', { body: 'Session complete!', silent: true });
    }
  }, [settings.alarm, settings.notifications]);

  const markStreak = useCallback(() => {
    const day = todayKey();
    setStreak((prev) => {
      if (prev.lastActiveDay === day) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = todayKey(yesterday);
      const next = prev.lastActiveDay === yKey ? prev.current + 1 : 1;
      return {
        current: next,
        best: Math.max(prev.best, next),
        lastActiveDay: day,
      };
    });
  }, []);

  const completePomodoro = useCallback(
    (state: PomodoroState): PomodoroState => {
      playAlarm();
      const counts = { ...state.counts };
      counts[state.mode] += 1;

      let nextMode: TimerMode = 'focus';
      let cycle = state.cycle;
      if (state.mode === 'focus') {
        markStreak();
        cycle += 1;
        nextMode = cycle % 4 === 0 ? 'long' : 'short';
        setToast('Focus session complete');
      } else {
        nextMode = 'focus';
        setToast('Break complete');
      }

      const remainingMs = state.durations[nextMode] * 1000;
      const auto =
        (nextMode === 'focus' && settings.autoStartFocus) ||
        (nextMode !== 'focus' && settings.autoStartBreaks);

      return {
        ...state,
        mode: nextMode,
        cycle,
        counts,
        remainingMs,
        isRunning: auto,
        endsAt: auto ? Date.now() + remainingMs : null,
      };
    },
    [markStreak, playAlarm, settings.autoStartBreaks, settings.autoStartFocus],
  );

  // Resolve pomodoro remaining from endsAt
  const pomodoroDisplayMs = useMemo(() => {
    if (pomodoro.isRunning && pomodoro.endsAt != null) {
      return Math.max(0, pomodoro.endsAt - now);
    }
    return pomodoro.remainingMs;
  }, [pomodoro.isRunning, pomodoro.endsAt, pomodoro.remainingMs, now]);

  const stopwatchDisplayMs = useMemo(() => {
    if (stopwatch.isRunning && stopwatch.startedAt != null) {
      return stopwatch.elapsedMs + (now - stopwatch.startedAt);
    }
    return stopwatch.elapsedMs;
  }, [stopwatch.isRunning, stopwatch.startedAt, stopwatch.elapsedMs, now]);

  // Pomodoro completion check
  useEffect(() => {
    if (!pomodoro.isRunning || pomodoro.endsAt == null) return;
    if (pomodoroDisplayMs > 0) return;
    if (completingRef.current) return;
    completingRef.current = true;
    setPomodoro((s) => completePomodoro(s));
    window.setTimeout(() => {
      completingRef.current = false;
    }, 500);
  }, [pomodoro.isRunning, pomodoro.endsAt, pomodoroDisplayMs, completePomodoro]);

  // Study time tracking — single stream when either timer is actively studying
  const isStudying =
    (pomodoro.isRunning && pomodoro.mode === 'focus') || stopwatch.isRunning;

  const rollStudyDay = useCallback((prev: StudyTrackerState): StudyTrackerState => {
    const day = todayKey();
    if (prev.dayKey === day) return prev;
    const flushed =
      prev.dailyMs +
      (prev.activeSince != null ? Math.max(0, Date.now() - prev.activeSince) : 0);
    if (flushed > 0) {
      setStudyHistory((h) =>
        pruneStudyHistory({
          ...h,
          [prev.dayKey]: Math.max(h[prev.dayKey] || 0, flushed),
        }),
      );
    }
    return { dayKey: day, dailyMs: 0, activeSince: null };
  }, []);

  useEffect(() => {
    setStudy((prev) => {
      let next = rollStudyDay(prev);

      if (isStudying && next.activeSince == null) {
        return { ...next, activeSince: Date.now() };
      }
      if (!isStudying && next.activeSince != null) {
        const delta = Date.now() - next.activeSince;
        const dailyMs = next.dailyMs + delta;
        if (focusTaskId) {
          setTasks((ts) =>
            ts.map((t) =>
              t.id === focusTaskId ? { ...t, accumulatedMs: t.accumulatedMs + delta } : t,
            ),
          );
        }
        return { ...next, dailyMs, activeSince: null };
      }
      return next;
    });
  }, [isStudying, focusTaskId, rollStudyDay]);

  // Flush study time periodically while active
  useEffect(() => {
    if (!isStudying) return;
    const id = window.setInterval(() => {
      setStudy((prev) => {
        const rolled = rollStudyDay(prev);
        if (rolled.activeSince == null && isStudying) {
          return { ...rolled, activeSince: Date.now() };
        }
        if (rolled.activeSince == null) return rolled;
        const delta = Date.now() - rolled.activeSince;
        if (delta < 5000) return rolled;
        if (focusTaskId) {
          setTasks((ts) =>
            ts.map((t) =>
              t.id === focusTaskId ? { ...t, accumulatedMs: t.accumulatedMs + delta } : t,
            ),
          );
        }
        return {
          ...rolled,
          dailyMs: rolled.dailyMs + delta,
          activeSince: Date.now(),
        };
      });
    }, 5000);
    return () => clearInterval(id);
  }, [isStudying, focusTaskId, rollStudyDay]);

  const studyLiveMs =
    study.dailyMs +
    (study.activeSince != null ? Math.max(0, now - study.activeSince) : 0);

  // Flush stopwatch daily total when paused
  useEffect(() => {
    if (stopwatch.isRunning) return;
  }, [stopwatch.isRunning]);

  const updateTheme = useCallback((patch: Partial<ThemeState>) => {
    setTheme((t) => ({ ...t, ...patch }));
  }, []);

  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const setDuration = useCallback((key: 'focus' | 'short' | 'long', seconds: number) => {
    const sec = clamp(seconds, 60, 180 * 60);
    setPomodoro((p) => {
      const durations = { ...p.durations, [key]: sec };
      if (p.isRunning || p.mode !== key) {
        return { ...p, durations };
      }
      return { ...p, durations, remainingMs: sec * 1000, endsAt: null };
    });
  }, []);

  const startPomodoro = useCallback(() => {
    setPomodoro((p) => {
      const remaining = p.isRunning && p.endsAt ? Math.max(0, p.endsAt - Date.now()) : p.remainingMs;
      const ms = remaining > 0 ? remaining : p.durations[p.mode] * 1000;
      return { ...p, isRunning: true, remainingMs: ms, endsAt: Date.now() + ms };
    });
  }, []);

  const pausePomodoro = useCallback(() => {
    setPomodoro((p) => {
      if (!p.isRunning || p.endsAt == null) return { ...p, isRunning: false, endsAt: null };
      return {
        ...p,
        isRunning: false,
        remainingMs: Math.max(0, p.endsAt - Date.now()),
        endsAt: null,
      };
    });
  }, []);

  const resetPomodoro = useCallback(() => {
    setPomodoro((p) => ({
      ...p,
      isRunning: false,
      endsAt: null,
      remainingMs: p.durations[p.mode] * 1000,
    }));
  }, []);

  const setPomodoroMode = useCallback((mode: TimerMode) => {
    setPomodoro((p) => ({
      ...p,
      mode,
      isRunning: false,
      endsAt: null,
      remainingMs: p.durations[mode] * 1000,
    }));
  }, []);

  const skipPomodoro = useCallback(() => {
    setPomodoro((p) => completePomodoro({ ...p, isRunning: false, endsAt: null }));
  }, [completePomodoro]);

  const startStopwatch = useCallback(() => {
    setStopwatch((s) => {
      const day = todayKey();
      const base =
        s.dayKey !== day
          ? { ...s, dayKey: day, dailyTotalMs: 0, elapsedMs: 0 }
          : s;
      if (base.isRunning) return base;
      return { ...base, isRunning: true, startedAt: Date.now() };
    });
  }, []);

  const pauseStopwatch = useCallback(() => {
    setStopwatch((s) => {
      if (!s.isRunning || s.startedAt == null) return { ...s, isRunning: false, startedAt: null };
      const add = Date.now() - s.startedAt;
      return {
        ...s,
        isRunning: false,
        startedAt: null,
        elapsedMs: s.elapsedMs + add,
        dailyTotalMs: s.dailyTotalMs + add,
      };
    });
  }, []);

  const resetStopwatch = useCallback(() => {
    setStopwatch((s) => ({
      ...s,
      isRunning: false,
      startedAt: null,
      elapsedMs: 0,
    }));
  }, []);

  const addTask = useCallback((title: string) => {
    const t = title.trim();
    if (!t) return;
    const task: Task = {
      id: uid(),
      title: t,
      status: 'todo',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accumulatedMs: 0,
    };
    setTasks((list) => [task, ...list]);
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t)),
    );
  }, []);

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((list) => list.filter((t) => t.id !== id));
      if (focusTaskId === id) setFocusTaskId(null);
    },
    [focusTaskId],
  );

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, status, updatedAt: Date.now() } : t)),
    );
  }, []);

  const setFocusTask = useCallback((id: string | null) => {
    setFocusTaskId(id);
    if (id) {
      setTasks((list) =>
        list.map((t) => ({
          ...t,
          focused: t.id === id,
          status: t.id === id && t.status === 'todo' ? 'in_progress' : t.status,
        })),
      );
    } else {
      setTasks((list) => list.map((t) => ({ ...t, focused: false })));
    }
  }, []);

  // Resume running timers after refresh
  useEffect(() => {
    setPomodoro((p) => {
      if (p.isRunning && p.endsAt != null) {
        const rem = p.endsAt - Date.now();
        if (rem <= 0) return completePomodoro(p);
        return p;
      }
      return p;
    });
    setStopwatch((s) => {
      if (s.isRunning && s.startedAt != null) return s;
      return s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (view === 'study') {
          if (stopwatch.isRunning) pauseStopwatch();
          else startStopwatch();
        } else {
          if (pomodoro.isRunning) pausePomodoro();
          else startPomodoro();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    view,
    stopwatch.isRunning,
    pomodoro.isRunning,
    startPomodoro,
    pausePomodoro,
    startStopwatch,
    pauseStopwatch,
  ]);

  // Keep track list valid
  useEffect(() => {
    if (!AMBIENT_TRACKS.some((t) => t.id === settings.selectedTrackId)) {
      updateSettings({ selectedTrackId: AMBIENT_TRACKS[0].id });
    }
  }, [settings.selectedTrackId, updateSettings]);

  const getCloudSnapshot = useCallback(() => {
    const day = study.dayKey;
    const history = pruneStudyHistory({
      ...studyHistory,
      [day]: Math.max(studyHistory[day] || 0, study.dailyMs),
    });
    return {
      theme,
      settings,
      tasks,
      focusTaskId,
      streak,
      pomodoro: { ...pomodoro, isRunning: false, endsAt: null },
      stopwatch: { ...stopwatch, isRunning: false, startedAt: null },
      study: { ...study, activeSince: null },
      studyHistory: history,
    };
  }, [
    theme,
    settings,
    tasks,
    focusTaskId,
    streak,
    pomodoro,
    stopwatch,
    study,
    studyHistory,
  ]);

  const applyCloudData = useCallback((data: Record<string, unknown>) => {
    if (!data || typeof data !== 'object') return;

    if (data.theme && typeof data.theme === 'object') {
      const incoming = data.theme as ThemeState;
      const media = incoming.customBackground;
      if (
        media &&
        media !== CUSTOM_MEDIA_IDB_MARKER &&
        dataUrlByteLength(media) > MAX_CUSTOM_MEDIA_BYTES
      ) {
        incoming.customBackground = null;
      }
      if (media && media !== CUSTOM_MEDIA_IDB_MARKER && media.length > 200_000) {
        void saveCustomMedia(media);
      }
      setTheme((t) => ({ ...t, ...incoming }));
    }
    if (data.settings && typeof data.settings === 'object') {
      setSettings((s) => ({ ...s, ...(data.settings as SettingsState) }));
    }
    if (Array.isArray(data.tasks)) {
      setTasks(data.tasks as Task[]);
    }
    if ('focusTaskId' in data) {
      setFocusTaskId((data.focusTaskId as string | null) ?? null);
    }
    if (data.streak && typeof data.streak === 'object') {
      setStreak((s) => ({ ...s, ...(data.streak as StreakState) }));
    }
    if (data.pomodoro && typeof data.pomodoro === 'object') {
      const p = data.pomodoro as PomodoroState;
      setPomodoro({
        ...defaultPomodoro(),
        ...p,
        isRunning: false,
        endsAt: null,
        remainingMs:
          p.remainingMs ??
          (p.durations?.[p.mode ?? 'focus'] ?? DEFAULT_DURATIONS.focus) * 1000,
      });
    }
    if (data.stopwatch && typeof data.stopwatch === 'object') {
      setStopwatch({
        ...defaultStopwatch(),
        ...(data.stopwatch as StopwatchState),
        isRunning: false,
        startedAt: null,
      });
    }
    if (data.study && typeof data.study === 'object') {
      const incoming = data.study as StudyTrackerState;
      setStudy((prev) => {
        const merged = {
          ...defaultStudy(),
          ...incoming,
          activeSince: null,
        };
        // Prefer the higher total for the same day so a sync can't wipe progress
        if (merged.dayKey === prev.dayKey) {
          merged.dailyMs = Math.max(prev.dailyMs, merged.dailyMs || 0);
        }
        return merged;
      });
    }
    if (data.studyHistory && typeof data.studyHistory === 'object') {
      setStudyHistory((prev) =>
        mergeStudyHistory(prev, data.studyHistory as StudyHistory),
      );
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      settings,
      pomodoro,
      stopwatch,
      study,
      studyHistory,
      studyLiveMs,
      streak,
      tasks,
      panel,
      view,
      focusTaskId,
      taskSearch,
      taskSort,
      taskFilter,
      now,
      setPanel,
      setView,
      updateTheme,
      updateSettings,
      setDuration,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
      skipPomodoro,
      setPomodoroMode,
      startStopwatch,
      pauseStopwatch,
      resetStopwatch,
      addTask,
      updateTask,
      deleteTask,
      setTaskStatus,
      setFocusTask,
      setTaskSearch,
      setTaskSort,
      setTaskFilter,
      pomodoroDisplayMs,
      stopwatchDisplayMs,
      playAlarm,
      toast,
      setToast,
      applyCloudData,
      getCloudSnapshot,
    }),
    [
      theme,
      settings,
      pomodoro,
      stopwatch,
      study,
      studyHistory,
      studyLiveMs,
      streak,
      tasks,
      panel,
      view,
      focusTaskId,
      taskSearch,
      taskSort,
      taskFilter,
      now,
      setView,
      updateTheme,
      updateSettings,
      setDuration,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
      skipPomodoro,
      setPomodoroMode,
      startStopwatch,
      pauseStopwatch,
      resetStopwatch,
      addTask,
      updateTask,
      deleteTask,
      setTaskStatus,
      setFocusTask,
      pomodoroDisplayMs,
      stopwatchDisplayMs,
      playAlarm,
      toast,
      applyCloudData,
      getCloudSnapshot,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

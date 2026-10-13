import { useEffect, useRef, useState } from 'react';
import { fetchMe, saveCloudData } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useApp } from '../store/AppContext';

/** Hydrate from MongoDB on session restore, and debounce-save on changes. */
export function CloudSync() {
  const { token, loading } = useAuth();
  const app = useApp();
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      setReady(false);
      return;
    }

    let cancelled = false;
    fetchMe(token)
      .then((res) => {
        if (cancelled) return;
        app.applyCloudData((res.data || {}) as Record<string, unknown>);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loading]);

  useEffect(() => {
    if (!token || loading || !ready) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveCloudData(token, app.getCloudSnapshot()).catch(() => {
        app.setToast('Could not sync to cloud');
      });
    }, 1000);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [
    token,
    loading,
    ready,
    app.theme,
    app.settings,
    app.tasks,
    app.focusTaskId,
    app.streak,
    app.pomodoro.durations,
    app.pomodoro.counts,
    app.pomodoro.mode,
    app.stopwatch.elapsedMs,
    app.study.dailyMs,
    app.studyHistory,
  ]);

  return null;
}

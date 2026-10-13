import { RotateCcw, SkipForward } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatHMS, formatMMSS } from '../utils/time';
import type { TimerMode } from '../types';
import { TimerRing } from './TimerRing';

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  short: 'Short Break',
  long: 'Long Break',
};

const BADGE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus session',
  short: 'Short Break session',
  long: 'Long Break session',
};

export function TimerDisplay() {
  const {
    view,
    setView,
    pomodoro,
    pomodoroDisplayMs,
    stopwatch,
    stopwatchDisplayMs,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    skipPomodoro,
    setPomodoroMode,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    tasks,
    focusTaskId,
  } = useApp();

  const focusTask = tasks.find((t) => t.id === focusTaskId);

  return (
    <div className={`main-stage ${view === 'study' ? 'study-stage' : ''}`}>
      <div className="timer-header">
        <div className="brand">Pomodoro Timer</div>
        <div className="view-toggle" role="tablist" aria-label="Timer mode">
          <button
            type="button"
            role="tab"
            className={view === 'pomodoro' ? 'active' : ''}
            aria-selected={view === 'pomodoro'}
            onClick={() => setView('pomodoro')}
          >
            Pomodoro
          </button>
          <button
            type="button"
            role="tab"
            className={view === 'study' ? 'active' : ''}
            aria-selected={view === 'study'}
            onClick={() => setView('study')}
          >
            Study
          </button>
        </div>
      </div>

      {view === 'pomodoro' ? (
        <>
          <div className="segmented mode-tabs" role="tablist">
            {(['focus', 'short', 'long'] as TimerMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                className={`seg mode-tab ${pomodoro.mode === mode ? 'active' : ''}`}
                aria-selected={pomodoro.mode === mode}
                onClick={() => setPomodoroMode(mode)}
              >
                {MODE_LABELS[mode]}
                <span className="sc mode-count">{pomodoro.counts[mode]}</span>
              </button>
            ))}
          </div>

          <div className="dial">
            <TimerRing />
            <div className="dial-inner">
              <div className="time">
                {formatMMSS(pomodoroDisplayMs / 1000)}
              </div>
              <div className="timer-badge">
                <span className="timer-badge-dot" />
                {BADGE_LABELS[pomodoro.mode]}
              </div>
            </div>
          </div>

          <div className="timer-controls">
            <button
              type="button"
              className="btn-icon"
              aria-label="Reset timer"
              onClick={resetPomodoro}
            >
              <RotateCcw size={18} />
            </button>
            <button
              type="button"
              className="btn-start"
              onClick={() =>
                pomodoro.isRunning ? pausePomodoro() : startPomodoro()
              }
            >
              {pomodoro.isRunning ? (
                <span className="pause-bars" aria-hidden>
                  <span />
                  <span />
                </span>
              ) : (
                <span className="play-tri" aria-hidden />
              )}
              {pomodoro.isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              className="btn-icon"
              aria-label="Skip session"
              onClick={skipPomodoro}
            >
              <SkipForward size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="segmented mode-tabs study-mode-tabs">
            <div className="seg mode-tab active">Study stopwatch</div>
          </div>

          <div className="dial dial-study">
            <TimerRing />
            <div className="dial-inner">
              <div className="time time-study">
                {formatHMS(stopwatchDisplayMs / 1000)}
              </div>
              <div className="timer-badge">
                <span className="timer-badge-dot" />
                {stopwatch.isRunning ? 'Recording' : 'Ready'}
              </div>
            </div>
          </div>

          <div className="timer-controls study-controls">
            <button
              type="button"
              className="btn-icon"
              aria-label="Reset stopwatch"
              onClick={resetStopwatch}
            >
              <RotateCcw size={18} />
            </button>
            <button
              type="button"
              className="btn-start"
              onClick={() =>
                stopwatch.isRunning ? pauseStopwatch() : startStopwatch()
              }
            >
              {stopwatch.isRunning ? (
                <span className="pause-bars" aria-hidden>
                  <span />
                  <span />
                </span>
              ) : (
                <span className="play-tri" aria-hidden />
              )}
              {stopwatch.isRunning ? 'Pause' : 'Start'}
            </button>
            {/* Balances the reset button so Start stays centered */}
            <span className="btn-icon-spacer" aria-hidden />
          </div>
        </>
      )}

      {focusTask && (
        <div className="focus-task-chip" title={focusTask.title}>
          <span className="timer-badge-dot" />
          <span>Focusing: {focusTask.title}</span>
        </div>
      )}
    </div>
  );
}

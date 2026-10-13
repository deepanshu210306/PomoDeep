import { Trophy } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatHMS } from '../../utils/time';

export function AchievementsPanel() {
  const { study, pomodoro, settings, now } = useApp();

  const dailyMs =
    study.dailyMs +
    (study.activeSince != null ? now - study.activeSince : 0);
  const goalMs = settings.dailyGoalMinutes * 60 * 1000;
  const progress = Math.min(1, dailyMs / goalMs);

  return (
    <aside className="panel" aria-label="Achievements">
      <div className="panel-scroll">
        <div className="tasks-header">
          <h2 className="tasks-title" style={{ fontSize: 20 }}>
            Challenge
          </h2>
        </div>
        <div className="simple-panel-body">
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
            <Trophy size={18} color="var(--accent)" />
            Daily study goal
          </p>
          <p style={{ marginTop: 8 }}>
            Hit {settings.dailyGoalMinutes} minutes of focused study today.
          </p>

          <div className="progress-track" style={{ maxWidth: '100%', height: 6, marginTop: 16 }}>
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <p style={{ marginTop: 8, fontSize: 13 }}>
            {formatHMS(dailyMs / 1000)} / {formatHMS(goalMs / 1000)}
          </p>

          <div className="stat-grid">
            <div className="stat-card">
              <strong>{pomodoro.counts.focus}</strong>
              <span>Focus sessions today</span>
            </div>
            <div className="stat-card">
              <strong>{Math.round(progress * 100)}%</strong>
              <span>Goal progress</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

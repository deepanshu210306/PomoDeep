import { Flame } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function StreakPanel() {
  const { streak, pomodoro } = useApp();

  return (
    <aside className="panel" aria-label="Streak">
      <div className="panel-scroll">
        <div className="tasks-header">
          <h2 className="tasks-title" style={{ fontSize: 20 }}>
            Streak
          </h2>
        </div>
        <div className="simple-panel-body">
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
            <Flame size={20} color="#f59e0b" />
            Keep the chain alive
          </p>
          <p style={{ marginTop: 8 }}>
            Complete at least one focus session each day to grow your streak.
          </p>

          <div className="stat-grid">
            <div className="stat-card">
              <strong>{streak.current}</strong>
              <span>Current streak</span>
            </div>
            <div className="stat-card">
              <strong>{streak.best}</strong>
              <span>Best streak</span>
            </div>
            <div className="stat-card">
              <strong>{pomodoro.counts.focus}</strong>
              <span>Focus today</span>
            </div>
            <div className="stat-card">
              <strong>{pomodoro.cycle}</strong>
              <span>Cycle count</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

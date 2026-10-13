import { ChartColumn, Clock3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { shiftDayKey, todayKey } from '../../utils/storage';
import { formatDurationShort } from '../../utils/time';

type Range = 7 | 14 | 30;

function labelDay(dayKey: string) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'short' });
}

function labelDate(dayKey: string) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function StudyHistoryPanel() {
  const { studyHistory, studyLiveMs, study, settings } = useApp();
  const [range, setRange] = useState<Range>(14);
  const [hover, setHover] = useState<string | null>(null);

  const today = todayKey();

  const days = useMemo(() => {
    const list: { day: string; ms: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const day = shiftDayKey(today, -i);
      const stored = studyHistory[day] || 0;
      const ms =
        day === study.dayKey ? Math.max(stored, studyLiveMs) : stored;
      list.push({ day, ms });
    }
    return list;
  }, [range, today, studyHistory, study.dayKey, studyLiveMs]);

  const totalMs = days.reduce((sum, d) => sum + d.ms, 0);
  const maxMs = Math.max(...days.map((d) => d.ms), 1);
  const avgMs = totalMs / days.length;
  const best = days.reduce(
    (acc, d) => (d.ms > acc.ms ? d : acc),
    days[0] ?? { day: today, ms: 0 },
  );
  const goalMs = settings.dailyGoalMinutes * 60 * 1000;
  const daysHitGoal = days.filter((d) => d.ms >= goalMs && goalMs > 0).length;

  const chartW = 320;
  const chartH = 180;
  const padX = 8;
  const padTop = 16;
  const padBottom = 28;
  const innerH = chartH - padTop - padBottom;
  const gap = range > 14 ? 3 : 6;
  const barW = (chartW - padX * 2 - gap * (days.length - 1)) / days.length;

  return (
    <aside className="panel panel-wide" aria-label="Study history">
      <div className="panel-scroll">
        <div className="tasks-header">
          <h2 className="tasks-title" style={{ fontSize: 20 }}>
            <ChartColumn
              size={18}
              style={{ marginRight: 8, verticalAlign: -3 }}
            />
            Study graph
          </h2>
        </div>

        <p className="study-hist-sub">
          Daily study stopwatch time — saved locally and to MongoDB when signed
          in.
        </p>

        <div className="study-hist-ranges">
          {([7, 14, 30] as const).map((n) => (
            <button
              key={n}
              type="button"
              className={`pill ${range === n ? 'active' : ''}`}
              onClick={() => setRange(n)}
            >
              {n}d
            </button>
          ))}
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <strong>{formatDurationShort(totalMs / 1000)}</strong>
            <span>Total ({range}d)</span>
          </div>
          <div className="stat-card">
            <strong>{formatDurationShort(avgMs / 1000)}</strong>
            <span>Daily avg</span>
          </div>
          <div className="stat-card">
            <strong>{formatDurationShort(studyLiveMs / 1000)}</strong>
            <span>Today</span>
          </div>
          <div className="stat-card">
            <strong>
              {daysHitGoal}/{range}
            </strong>
            <span>Goal days</span>
          </div>
        </div>

        <div className="study-chart-wrap">
          <svg
            className="study-chart"
            viewBox={`0 0 ${chartW} ${chartH}`}
            role="img"
            aria-label={`Study time over the last ${range} days`}
          >
            {[0.25, 0.5, 0.75, 1].map((t) => {
              const y = padTop + innerH * (1 - t);
              return (
                <line
                  key={t}
                  x1={padX}
                  x2={chartW - padX}
                  y1={y}
                  y2={y}
                  className="study-chart-grid"
                />
              );
            })}

            {days.map((d, i) => {
              const h = Math.max(d.ms > 0 ? 3 : 0, (d.ms / maxMs) * innerH);
              const x = padX + i * (barW + gap);
              const y = padTop + innerH - h;
              const active = hover === d.day || d.day === today;
              const hitGoal = goalMs > 0 && d.ms >= goalMs;
              return (
                <g
                  key={d.day}
                  onMouseEnter={() => setHover(d.day)}
                  onMouseLeave={() => setHover(null)}
                >
                  <rect
                    x={x}
                    y={padTop}
                    width={barW}
                    height={innerH}
                    className="study-chart-hit"
                  />
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx={Math.min(4, barW / 2)}
                    className={`study-chart-bar ${active ? 'active' : ''} ${hitGoal ? 'goal' : ''}`}
                  />
                  {(range <= 14 || i % 2 === 0 || d.day === today) && (
                    <text
                      x={x + barW / 2}
                      y={chartH - 8}
                      className={`study-chart-label ${d.day === today ? 'today' : ''}`}
                      textAnchor="middle"
                    >
                      {labelDay(d.day)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="study-chart-tooltip" aria-live="polite">
            {hover ? (
              <>
                <Clock3 size={14} />
                <span>
                  {labelDate(hover)} —{' '}
                  {formatDurationShort(
                    (days.find((d) => d.day === hover)?.ms || 0) / 1000,
                  )}
                </span>
              </>
            ) : (
              <>
                <Clock3 size={14} />
                <span>
                  Best day: {labelDate(best.day)} (
                  {formatDurationShort(best.ms / 1000)})
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

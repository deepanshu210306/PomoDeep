import { ACCENTS } from '../config/theme';
import { useApp } from '../store/AppContext';

/**
 * Exact dial ring from pomodorotimer.online:
 * viewBox 300, r=132, white→accent diagonal gradient, SVG rotate(-90deg), always filled.
 */
export function TimerRing({ className = '' }: { className?: string }) {
  const { theme } = useApp();
  const accent = ACCENTS[theme.accent];
  const gradId = `rg-${theme.accent}`;

  // Full circumference for r=132: 2πr ≈ 829.38
  const circumference = 2 * Math.PI * 132;

  return (
    <svg
      className={`dial-ring ${className}`}
      viewBox="0 0 300 300"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          {/* 0.9× previous intensity */}
          <stop offset="0%" stopColor="#fff" stopOpacity="0.81" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <circle className="rtrack" cx="150" cy="150" r="132" />
      <circle
        className="rfill"
        cx="150"
        cy="150"
        r="132"
        stroke={`url(#${gradId})`}
        strokeDasharray={circumference}
        strokeDashoffset={0}
      />
    </svg>
  );
}

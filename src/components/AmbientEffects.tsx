import { useMemo } from 'react';
import { useApp } from '../store/AppContext';

function seeded(n: number) {
  const x = Math.sin(n * 999) * 10000;
  return x - Math.floor(x);
}

export function AmbientEffects() {
  const { theme } = useApp();
  const effect = theme.effect;

  const motes = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        left: `${seeded(i + 1) * 100}%`,
        size: 1.8 + seeded(i + 2) * 3.5,
        duration: 12 + seeded(i + 3) * 18,
        delay: seeded(i + 4) * -22,
        drift: (seeded(i + 5) - 0.5) * 50,
        opacity: 0.28 + seeded(i + 6) * 0.32,
      })),
    [],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        left: `${seeded(i + 10) * 100}%`,
        top: `${seeded(i + 20) * 100}%`,
        size: 1 + seeded(i + 25) * 1.6,
        duration: 2 + seeded(i + 30) * 4,
        delay: seeded(i + 40) * 3,
      })),
    [],
  );

  const rain = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: `${seeded(i + 50) * 100}%`,
        height: 14 + seeded(i + 51) * 18,
        duration: 0.7 + seeded(i + 52) * 0.8,
        delay: seeded(i + 53) * -2,
        opacity: 0.22 + seeded(i + 54) * 0.28,
      })),
    [],
  );

  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${seeded(i + 70) * 100}%`,
        size: 8 + seeded(i + 71) * 18,
        duration: 12 + seeded(i + 72) * 16,
        delay: seeded(i + 73) * -15,
      })),
    [],
  );

  if (effect === 'off') return null;

  return (
    <div className={`ambient-layer ambient-${effect}`} aria-hidden>
      {effect === 'motes' &&
        motes.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: m.left,
              width: m.size,
              height: m.size,
              opacity: m.opacity,
              ['--drift' as string]: `${m.drift}px`,
              animationDuration: `${m.duration}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      {effect === 'stars' &&
        stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      {effect === 'rain' &&
        rain.map((r, i) => (
          <span
            key={i}
            className="rain-drop"
            style={{
              left: r.left,
              height: r.height,
              opacity: r.opacity,
              animationDuration: `${r.duration}s`,
              animationDelay: `${r.delay}s`,
            }}
          />
        ))}
      {effect === 'bubbles' &&
        bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
    </div>
  );
}

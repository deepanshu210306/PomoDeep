export type AccentKey = 'blue' | 'violet' | 'teal' | 'lime' | 'rose' | 'amber';
export type BackgroundKey =
  | 'fantasy'
  | 'pastel'
  | 'lofi'
  | 'cyberpunk'
  | 'samurai'
  | 'pika'
  | 'aurora'
  | 'ocean'
  | 'neon'
  | 'cafe'
  | 'custom';
export type AmbientEffect = 'off' | 'motes' | 'stars' | 'rain' | 'bubbles';
export type LanguageKey = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja';

export const ACCENTS: Record<AccentKey, string> = {
  blue: '#60a5fa',
  violet: '#a78bfa',
  teal: '#2dd4bf',
  lime: '#a3e635',
  rose: '#fb7185',
  amber: '#f2c879',
};

export const BACKGROUND_LABELS: Record<BackgroundKey, string> = {
  fantasy: 'Fantasy',
  pastel: 'Pastel',
  lofi: 'Lofi',
  cyberpunk: 'Cyberpunk',
  samurai: 'Samurai',
  pika: 'Pika Study',
  aurora: 'Aurora',
  ocean: 'Ocean',
  neon: 'Neon',
  cafe: 'Cafe',
  custom: 'Custom',
};

/** HD presets — Unsplash / Pexels / reference site (publicly hosted). */
export const BACKGROUND_PRESETS: Record<
  Exclude<BackgroundKey, 'custom'>,
  { image: string; video?: string; glow: string }
> = {
  fantasy: {
    image: 'https://pomodorotimer.online/bg-fantasy.webp',
    glow: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(120,80,180,0.35), transparent 60%), radial-gradient(ellipse 50% 40% at 70% 70%, rgba(180,60,80,0.2), transparent 55%)',
  },
  pastel: {
    image: 'https://pomodorotimer.online/bg-pastel.webp',
    glow: 'radial-gradient(ellipse 70% 50% at 40% 30%, rgba(255,180,200,0.25), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(180,200,255,0.2), transparent 50%)',
  },
  lofi: {
    image: 'https://pomodorotimer.online/bg-lofi.webp',
    video: 'https://pomodorotimer.online/bg-lofi.mp4',
    glow: 'radial-gradient(ellipse 70% 50% at 25% 50%, rgba(180,80,100,0.3), transparent 55%), radial-gradient(ellipse 50% 40% at 75% 40%, rgba(80,60,140,0.25), transparent 50%)',
  },
  cyberpunk: {
    image: 'https://pomodorotimer.online/bg-cyberpunk.webp',
    glow: 'radial-gradient(ellipse 60% 50% at 20% 60%, rgba(0,200,255,0.2), transparent 50%), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(255,0,150,0.25), transparent 50%)',
  },
  samurai: {
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=85',
    glow: 'radial-gradient(ellipse 70% 55% at 40% 35%, rgba(200,60,40,0.28), transparent 55%), radial-gradient(ellipse 50% 40% at 75% 70%, rgba(40,20,10,0.35), transparent 50%)',
  },
  pika: {
    // Warm electric-yellow study vibe — royalty-free stock (not Pokémon IP)
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=85',
    glow: 'radial-gradient(ellipse 70% 50% at 35% 40%, rgba(255,210,60,0.38), transparent 55%), radial-gradient(ellipse 45% 40% at 80% 60%, rgba(255,140,40,0.25), transparent 50%)',
  },
  aurora: {
    image:
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1920&q=85',
    glow: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(80,220,180,0.3), transparent 55%), radial-gradient(ellipse 50% 40% at 20% 70%, rgba(100,120,255,0.25), transparent 50%)',
  },
  ocean: {
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=85',
    video:
      'https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4',
    glow: 'radial-gradient(ellipse 70% 50% at 40% 45%, rgba(40,120,180,0.3), transparent 55%), radial-gradient(ellipse 45% 35% at 70% 20%, rgba(255,255,255,0.12), transparent 50%)',
  },
  neon: {
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85',
    video:
      'https://videos.pexels.com/video-files/1851190/1851190-uhd_2560_1440_25fps.mp4',
    glow: 'radial-gradient(ellipse 60% 50% at 25% 50%, rgba(255,0,120,0.28), transparent 50%), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(0,220,255,0.25), transparent 50%)',
  },
  cafe: {
    image:
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1920&q=85',
    glow: 'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(180,100,40,0.28), transparent 55%), radial-gradient(ellipse 50% 40% at 75% 35%, rgba(80,40,20,0.3), transparent 50%)',
  },
};

export const LANGUAGES: { key: LanguageKey; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
  { key: 'fr', label: 'Français' },
  { key: 'de', label: 'Deutsch' },
  { key: 'pt', label: 'Português' },
  { key: 'ja', label: '日本語' },
];

export const DEFAULT_DURATIONS = {
  focus: 90 * 60,
  short: 5 * 60,
  long: 15 * 60,
} as const;

export const DURATION_LIMITS = {
  min: 60,
  max: 180 * 60,
  step: 60,
} as const;

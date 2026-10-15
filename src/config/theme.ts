export type AccentKey = 'blue' | 'violet' | 'teal' | 'lime' | 'rose' | 'amber';
export type BackgroundKey =
  | 'pastel'
  | 'lofi'
  | 'cyberpunk'
  | 'ocean'
  | 'cat-playing'
  | 'cat-twin'
  | 'cute-cat'
  | 'study-cat'
  | 'mount-abu'
  | 'samurai'
  | 'samurai-moon'
  | 'samurai-town'
  | 'custom';
export type AmbientEffect = 'off' | 'motes' | 'stars' | 'rain' | 'bubbles';
export type LanguageKey = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja';

/** Encode a public/ filename for use as a URL path. */
export function publicAsset(filename: string): string {
  return `/${filename.split('/').map(encodeURIComponent).join('/')}`;
}

export const ACCENTS: Record<AccentKey, string> = {
  blue: '#60a5fa',
  violet: '#a78bfa',
  teal: '#2dd4bf',
  lime: '#a3e635',
  rose: '#fb7185',
  amber: '#f2c879',
};

export const BACKGROUND_LABELS: Record<BackgroundKey, string> = {
  pastel: 'Pastel',
  lofi: 'Lofi',
  cyberpunk: 'Cyberpunk',
  ocean: 'Ocean',
  'cat-playing': 'Cat Playing',
  'cat-twin': 'Cat Twin',
  'cute-cat': 'Cute Cat',
  'study-cat': 'Study Cat',
  'mount-abu': 'Mount Abu',
  samurai: 'Samurai',
  'samurai-moon': 'Samurai & Moon',
  'samurai-town': 'Samurai Town',
  custom: 'Custom',
};

const warmGlow =
  'radial-gradient(ellipse 70% 50% at 30% 40%, rgba(180,80,100,0.28), transparent 55%), radial-gradient(ellipse 50% 40% at 75% 60%, rgba(80,60,140,0.22), transparent 50%)';
const coolGlow =
  'radial-gradient(ellipse 70% 50% at 40% 45%, rgba(40,120,180,0.28), transparent 55%), radial-gradient(ellipse 45% 35% at 70% 20%, rgba(255,255,255,0.1), transparent 50%)';
const inkGlow =
  'radial-gradient(ellipse 70% 55% at 40% 35%, rgba(200,60,40,0.26), transparent 55%), radial-gradient(ellipse 50% 40% at 75% 70%, rgba(40,20,10,0.32), transparent 50%)';

/** Background presets — local public assets + a few remote keepers. */
export const BACKGROUND_PRESETS: Record<
  Exclude<BackgroundKey, 'custom'>,
  { image?: string; video?: string; glow: string }
> = {
  pastel: {
    image: 'https://pomodorotimer.online/bg-pastel.webp',
    glow: 'radial-gradient(ellipse 70% 50% at 40% 30%, rgba(255,180,200,0.25), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(180,200,255,0.2), transparent 50%)',
  },
  lofi: {
    image: 'https://pomodorotimer.online/bg-lofi.webp',
    video: 'https://pomodorotimer.online/bg-lofi.mp4',
    glow: warmGlow,
  },
  cyberpunk: {
    image: 'https://pomodorotimer.online/bg-cyberpunk.webp',
    glow: 'radial-gradient(ellipse 60% 50% at 20% 60%, rgba(0,200,255,0.2), transparent 50%), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(255,0,150,0.25), transparent 50%)',
  },
  ocean: {
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=85',
    video:
      'https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4',
    glow: coolGlow,
  },
  'cat-playing': {
    video: publicAsset('Cat Playing.mp4'),
    glow: warmGlow,
  },
  'cat-twin': {
    video: publicAsset('Cat Twin.mp4'),
    glow: warmGlow,
  },
  'cute-cat': {
    video: publicAsset('Cute Cat.mp4'),
    glow: warmGlow,
  },
  'study-cat': {
    video: publicAsset('Study Cat.mp4'),
    glow: warmGlow,
  },
  'mount-abu': {
    image: publicAsset('Mount Abu.jpg'),
    glow: coolGlow,
  },
  samurai: {
    image: publicAsset('Samurai.jpg'),
    glow: inkGlow,
  },
  'samurai-moon': {
    image: publicAsset('Samurai & Moon.jpg'),
    glow: inkGlow,
  },
  'samurai-town': {
    image: publicAsset('samurai town.png'),
    glow: inkGlow,
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

export function isBackgroundKey(value: string): value is BackgroundKey {
  return value === 'custom' || value in BACKGROUND_PRESETS;
}

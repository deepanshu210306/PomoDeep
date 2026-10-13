import {
  Brain,
  Coffee,
  Globe,
  ImageIcon,
  LogIn,
  LogOut,
  Palette,
  Sofa,
  Sparkles,
  UserRound,
  Video,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import {
  ACCENTS,
  BACKGROUND_LABELS,
  LANGUAGES,
  type AccentKey,
  type AmbientEffect,
  type BackgroundKey,
  type LanguageKey,
} from '../../config/theme';
import { useApp } from '../../store/AppContext';
import {
  isVideoSrc,
  MAX_CUSTOM_MEDIA_BYTES,
} from '../../utils/customMedia';

const BACKGROUNDS: BackgroundKey[] = [
  'fantasy',
  'pastel',
  'lofi',
  'cyberpunk',
  'samurai',
  'pika',
  'aurora',
  'ocean',
  'neon',
  'cafe',
  'custom',
];

const EFFECTS: AmbientEffect[] = ['off', 'motes', 'stars', 'rain', 'bubbles'];

const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

function labelBg(key: BackgroundKey) {
  return BACKGROUND_LABELS[key];
}

function labelEffect(key: AmbientEffect) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function SettingsPanel() {
  const {
    theme,
    updateTheme,
    pomodoro,
    setDuration,
    settings,
    updateSettings,
    setToast,
  } = useApp();
  const { user, loading: authLoading, setAuthOpen, logout } = useAuth();

  const adjust = (key: 'focus' | 'short' | 'long', delta: number) => {
    setDuration(key, pomodoro.durations[key] + delta);
  };

  const onCustomFile = (file: File | null) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setToast('Use an image or video file');
      return;
    }
    if (file.size > MAX_CUSTOM_MEDIA_BYTES) {
      setToast('Custom media must be 5 MB or smaller');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateTheme({
        background: 'custom',
        customBackground: String(reader.result),
      });
      setToast(
        isVideo
          ? 'Custom video saved (syncs when signed in)'
          : 'Custom image saved (syncs when signed in)',
      );
    };
    reader.onerror = () => setToast('Could not read file');
    reader.readAsDataURL(file);
  };

  const customIsVideo = isVideoSrc(theme.customBackground);

  return (
    <aside className="panel" aria-label="Settings">
      <div className="panel-scroll">
        <p className="section-label">Account</p>
        <div className="account-block">
          {authLoading ? (
            <p className="account-status">Checking session…</p>
          ) : user ? (
            <>
              <div className="account-user">
                <UserRound size={18} />
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              <p className="account-hint">
                Your settings sync to the cloud and load when you open the timer.
              </p>
              <button
                type="button"
                className="btn-ghost account-btn"
                onClick={logout}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="account-hint">
                Sign in to save settings, tasks, study time, and custom
                image/video (up to 5 MB) to MongoDB.
              </p>
              <button
                type="button"
                className="btn-accent account-btn"
                onClick={() => setAuthOpen(true)}
              >
                <LogIn size={16} />
                Sign in / Register
              </button>
            </>
          )}
        </div>

        <div className="section-divider" />

        <div className="setting-row align-center">
          <div className="setting-label">
            <Globe />
            Language
          </div>
          <div className="lang-select">
            <select
              aria-label="Language"
              value={theme.language}
              onChange={(e) =>
                updateTheme({ language: e.target.value as LanguageKey })
              }
            >
              {LANGUAGES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="section-label" style={{ marginTop: 12 }}>
          Appearance
        </p>

        <div className="setting-row stack">
          <div className="setting-label">
            <ImageIcon />
            Background
          </div>
          <div className="setting-controls">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg}
                type="button"
                className={`pill ${theme.background === bg ? 'active' : ''}`}
                onClick={() => updateTheme({ background: bg })}
              >
                {labelBg(bg)}
              </button>
            ))}
          </div>
        </div>

        {theme.background === 'custom' && (
          <div className="custom-upload">
            <label>
              {customIsVideo ? <Video size={16} /> : <ImageIcon size={16} />}
              Upload image or video (max 5 MB)
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/ogg"
                onChange={(e) => onCustomFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {theme.customBackground && (
              <p className="custom-upload-meta">
                {customIsVideo ? 'Video' : 'Image'} ready
                {user
                  ? ' · synced to MongoDB when online'
                  : ' · sign in to keep it in the cloud'}
              </p>
            )}
          </div>
        )}

        <div className="setting-row align-center">
          <div className="setting-label">
            <Palette />
            Accent
          </div>
          <div className="setting-controls">
            {ACCENT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`swatch ${theme.accent === key ? 'active' : ''}`}
                style={{ background: ACCENTS[key] }}
                aria-label={key}
                onClick={() => updateTheme({ accent: key })}
              />
            ))}
          </div>
        </div>

        <div className="setting-row stack">
          <div className="setting-label">
            <Sparkles />
            Ambient effect
          </div>
          <div className="setting-controls">
            {EFFECTS.map((fx) => (
              <button
                key={fx}
                type="button"
                className={`pill ${theme.effect === fx ? 'active' : ''}`}
                onClick={() => updateTheme({ effect: fx })}
              >
                {labelEffect(fx)}
              </button>
            ))}
          </div>
        </div>

        <div className="section-divider" />
        <p className="section-label">Timer</p>

        <div className="setting-row align-center">
          <div className="setting-label">
            <Brain />
            Concentration
          </div>
          <div className="stepper">
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => adjust('focus', -60)}
            >
              −
            </button>
            <span className="stepper-value">
              {Math.round(pomodoro.durations.focus / 60)} min
            </span>
            <button
              type="button"
              aria-label="Increase"
              onClick={() => adjust('focus', 60)}
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-row align-center">
          <div className="setting-label">
            <Coffee />
            Short break
          </div>
          <div className="stepper">
            <button
              type="button"
              aria-label="Decrease short break"
              onClick={() => adjust('short', -60)}
            >
              −
            </button>
            <span className="stepper-value">
              {Math.round(pomodoro.durations.short / 60)} min
            </span>
            <button
              type="button"
              aria-label="Increase short break"
              onClick={() => adjust('short', 60)}
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-row align-center">
          <div className="setting-label">
            <Sofa />
            Long break
          </div>
          <div className="stepper">
            <button
              type="button"
              aria-label="Decrease long break"
              onClick={() => adjust('long', -60)}
            >
              −
            </button>
            <span className="stepper-value">
              {Math.round(pomodoro.durations.long / 60)} min
            </span>
            <button
              type="button"
              aria-label="Increase long break"
              onClick={() => adjust('long', 60)}
            >
              +
            </button>
          </div>
        </div>

        <div className="section-divider" />
        <p className="section-label">General</p>

        <div className="setting-row align-center">
          <div className="setting-label">Auto-start breaks</div>
          <button
            type="button"
            className={`toggle ${settings.autoStartBreaks ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.autoStartBreaks}
            onClick={() =>
              updateSettings({ autoStartBreaks: !settings.autoStartBreaks })
            }
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="setting-row align-center">
          <div className="setting-label">Auto-start focus</div>
          <button
            type="button"
            className={`toggle ${settings.autoStartFocus ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.autoStartFocus}
            onClick={() =>
              updateSettings({ autoStartFocus: !settings.autoStartFocus })
            }
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="setting-row align-center">
          <div className="setting-label">Alarm</div>
          <button
            type="button"
            className={`toggle ${settings.alarm ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.alarm}
            onClick={() => updateSettings({ alarm: !settings.alarm })}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="setting-row align-center">
          <div className="setting-label">Notifications</div>
          <button
            type="button"
            className={`toggle ${settings.notifications ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.notifications}
            onClick={async () => {
              if (!settings.notifications && 'Notification' in window) {
                await Notification.requestPermission();
              }
              updateSettings({ notifications: !settings.notifications });
            }}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>
    </aside>
  );
}

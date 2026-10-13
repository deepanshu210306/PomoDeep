import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useApp } from '../store/AppContext';

export function AuthModal() {
  const { authOpen, setAuthOpen, login, register } = useAuth();
  const app = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!authOpen) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let data: Record<string, unknown>;
      if (mode === 'login') {
        data = (await login(email.trim(), password)) as Record<string, unknown>;
      } else {
        // Avoid uploading huge custom media in the register payload;
        // CloudSync will persist full settings right after sign-in.
        const snapshot = app.getCloudSnapshot() as Record<string, unknown>;
        const theme = snapshot.theme as Record<string, unknown> | undefined;
        const slim = {
          ...snapshot,
          theme: theme
            ? { ...theme, customBackground: null }
            : theme,
        };
        data = (await register(
          name.trim(),
          email.trim(),
          password,
          slim,
        )) as Record<string, unknown>;
      }
      app.applyCloudData(data);
      app.setToast(mode === 'login' ? 'Welcome back' : 'Account created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-backdrop" onClick={() => setAuthOpen(false)}>
      <div
        className="auth-modal"
        role="dialog"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="auth-title">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        <p className="auth-sub">
          Save themes, timer settings, and tasks to MongoDB so they load
          automatically when you open the timer.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {mode === 'register' && (
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-accent auth-submit" disabled={busy}>
            {busy
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { Music2 } from 'lucide-react';
import { LOFI_TRACKS } from '../../config/tracks';
import { useApp } from '../../store/AppContext';

export function MusicPanel() {
  const { settings, updateSettings } = useApp();

  return (
    <aside className="panel" aria-label="Music">
      <div className="panel-scroll">
        <p className="section-label">Sound</p>

        <div className="setting-row align-center">
          <div className="setting-label">
            <Music2 />
            Ambient sound
          </div>
          <button
            type="button"
            className={`toggle ${settings.ambientEnabled ? 'on' : ''}`}
            role="switch"
            aria-checked={settings.ambientEnabled}
            aria-label="Ambient sound"
            onClick={() =>
              updateSettings({ ambientEnabled: !settings.ambientEnabled })
            }
          >
            <span className="toggle-knob" />
          </button>
        </div>

        {settings.ambientEnabled && (
          <div className="volume-row">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={settings.ambientVolume}
              aria-label="Volume"
              onChange={(e) =>
                updateSettings({ ambientVolume: Number(e.target.value) })
              }
            />
          </div>
        )}

        <div className="section-divider" />
        <p className="section-label">Lofi tracks</p>

        <div className="track-list" role="listbox" aria-label="Lofi tracks">
          {LOFI_TRACKS.map((track, index) => {
            const active = settings.selectedTrackId === track.id;
            const playing = active && settings.ambientEnabled;
            return (
              <button
                key={track.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`track-item ${active ? 'active' : ''} ${playing ? 'playing' : ''}`}
                onClick={() => {
                  updateSettings({
                    selectedTrackId: track.id,
                    ambientEnabled: true,
                  });
                }}
              >
                <span className="track-num">{index + 1}</span>
                <span className="track-name">{track.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

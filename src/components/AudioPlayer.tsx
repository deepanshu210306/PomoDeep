import { useEffect, useRef, useState } from 'react';
import { AMBIENT_TRACKS } from '../config/tracks';
import { useApp } from '../store/AppContext';

/** Keeps a single audio element alive across panel navigation. */
export function AudioPlayer() {
  const { settings, updateSettings } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackIdRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const track =
    AMBIENT_TRACKS.find((t) => t.id === settings.selectedTrackId) ??
    AMBIENT_TRACKS[0];

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onError = () => {
      setError('Unable to play this track. Try another or check your connection.');
      updateSettings({ ambientEnabled: false });
    };
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [updateSettings]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = settings.ambientVolume;
  }, [settings.ambientVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const trackChanged = trackIdRef.current !== track.id;
    if (trackChanged) {
      trackIdRef.current = track.id;
      audio.src = track.url;
    }

    if (settings.ambientEnabled) {
      setError(null);
      audio.play().catch(() => {
        setError('Playback blocked by the browser. Toggle Ambient sound to retry.');
        updateSettings({ ambientEnabled: false });
      });
    } else {
      audio.pause();
    }
  }, [settings.ambientEnabled, track.id, track.url, updateSettings]);

  if (!error) return null;

  return (
    <div
      className="music-error"
      role="status"
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        padding: '8px 14px',
        borderRadius: 999,
        background: 'rgba(20,12,16,0.9)',
        border: '1px solid rgba(248,113,113,0.35)',
      }}
    >
      {error}
    </div>
  );
}

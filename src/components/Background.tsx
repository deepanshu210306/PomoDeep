import { BACKGROUND_PRESETS } from '../config/theme';
import { useApp } from '../store/AppContext';
import { isVideoSrc } from '../utils/customMedia';

export function Background() {
  const { theme } = useApp();
  const preset =
    theme.background === 'custom'
      ? null
      : BACKGROUND_PRESETS[theme.background];

  const custom = theme.customBackground;
  const customIsVideo = theme.background === 'custom' && isVideoSrc(custom);

  const imageSrc =
    theme.background === 'custom'
      ? customIsVideo
        ? undefined
        : custom || undefined
      : preset?.image;

  const videoSrc =
    theme.background === 'custom'
      ? customIsVideo
        ? custom || undefined
        : undefined
      : preset?.video;

  const glow =
    theme.background === 'custom'
      ? 'radial-gradient(ellipse 70% 50% at 30% 40%, rgba(180,80,100,0.25), transparent 55%)'
      : preset?.glow;

  return (
    <div className="bg-layer" aria-hidden>
      {imageSrc && (
        <img className="bg-image" src={imageSrc} alt="" draggable={false} />
      )}
      {videoSrc && (
        <video
          className="bg-video"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      {!imageSrc && !videoSrc && (
        <div
          className="bg-image"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, #2a1a3a, #06050e 70%)',
          }}
        />
      )}
      <div className="bg-overlay" />
      {glow && <div className="bg-glow" style={{ background: glow }} />}
    </div>
  );
}

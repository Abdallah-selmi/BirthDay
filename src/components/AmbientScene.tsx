import { motion } from 'framer-motion';
import type { FloatingItem } from '../utils/particles';

interface AmbientSceneProps {
  hearts: FloatingItem[];
  particles: FloatingItem[];
  variant?: 'landing' | 'celebration';
  parallax?: number;
  particleScale?: number;
  reducedMotion?: boolean;
}

export function AmbientScene({
  hearts,
  particles,
  variant = 'landing',
  parallax = 0,
  particleScale = 1,
  reducedMotion = false,
}: AmbientSceneProps) {
  const heartBase = variant === 'celebration' ? 28 : 22;
  const heartSize = heartBase * particleScale;

  return (
    <>
      <div className="ambient-vignette" aria-hidden />
      <div className="ambient-light ambient-light--left" aria-hidden />
      <div className="ambient-light ambient-light--right" aria-hidden />
      {!reducedMotion && (
        <motion.div
          className="ambient-blur-layer"
          aria-hidden
          animate={{ x: parallax * 0.3, y: parallax * 0.15 }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
      )}

      <div className="particles-container">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top ?? 0}%`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
              transform: `scale(${(p.size ?? 1) * particleScale})`,
            }}
          />
        ))}
      </div>

      <div className={variant === 'celebration' ? 'celebration-particles' : 'hearts-container'}>
        {hearts.map((h) => (
          <span
            key={h.id}
            className={variant === 'celebration' ? 'rose-petal' : 'floating-heart'}
            style={{
              left: `${h.left}%`,
              animationDuration: reducedMotion ? '0.01s' : `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              fontSize: `${heartSize + (h.size ?? 1) * (variant === 'celebration' ? 12 : 8)}px`,
            }}
          >
            {variant === 'celebration' ? '🌹' : '❤️'}
          </span>
        ))}
      </div>
    </>
  );
}

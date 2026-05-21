import { motion } from 'framer-motion';
import type { FloatingItem } from '../utils/particles';

interface AmbientSceneProps {
  hearts: FloatingItem[];
  particles: FloatingItem[];
  variant?: 'landing' | 'celebration';
  parallax?: number;
}

export function AmbientScene({
  hearts,
  particles,
  variant = 'landing',
  parallax = 0,
}: AmbientSceneProps) {
  return (
    <>
      <div className="ambient-vignette" aria-hidden />
      <div className="ambient-light ambient-light--left" aria-hidden />
      <div className="ambient-light ambient-light--right" aria-hidden />
      <motion.div
        className="ambient-blur-layer"
        aria-hidden
        animate={{ x: parallax * 0.3, y: parallax * 0.15 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      />

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
              transform: `scale(${p.size ?? 1})`,
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
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              fontSize: variant === 'celebration' ? `${28 + (h.size ?? 1) * 16}px` : undefined,
            }}
          >
            {variant === 'celebration' ? '🌹' : '❤️'}
          </span>
        ))}
      </div>
    </>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AmbientScene } from './AmbientScene';
import { MusicToggle } from './MusicToggle';
import { EscapeButton } from './EscapeButton';
import { generateFloatingItems } from '../utils/particles';
import type { useEscapeButton } from '../hooks/useEscapeButton';
import type { AdaptiveCounts } from '../utils/breakpoints';

interface LandingPageProps {
  playing: boolean;
  onToggleMusic: () => void;
  onCaught: () => void;
  screenShake: boolean;
  escape: ReturnType<typeof useEscapeButton>;
  counts: AdaptiveCounts;
  particleScale: number;
  isReducedMotion: boolean;
}

export function LandingPage({
  playing,
  onToggleMusic,
  onCaught,
  screenShake,
  escape,
  counts,
  particleScale,
  isReducedMotion,
}: LandingPageProps) {
  const hearts = useMemo(
    () => generateFloatingItems(counts.hearts),
    [counts.hearts]
  );
  const particles = useMemo(
    () => generateFloatingItems(counts.particles),
    [counts.particles]
  );

  return (
    <motion.div
      className={`landing-page scene-page ${screenShake || escape.screenShake ? 'screen-shake' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isReducedMotion ? 0.2 : 0.8 }}
    >
      <div className="cinematic-gradient" aria-hidden />
      <AmbientScene
        hearts={hearts}
        particles={particles}
        variant="landing"
        particleScale={particleScale}
        reducedMotion={isReducedMotion}
      />

      <MusicToggle playing={playing} onToggle={onToggleMusic} />

      <div className="landing-layout">
        <div className="landing-content">
          <motion.div
            className="landing-card glass-card"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h1
              className="landing-title glow-text bloom-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Someone has a surprise for you ❤️
            </motion.h1>
            <motion.p
              className="landing-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
            >
              Come closer... if you can
            </motion.p>
          </motion.div>
        </div>
      </div>

      <EscapeButton
        buttonRef={escape.buttonRef}
        position={escape.position}
        catchable={escape.catchable}
        teaseMsg={escape.teaseMsg}
        onCatch={onCaught}
      />
    </motion.div>
  );
}

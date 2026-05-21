import { useMemo, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { AmbientScene } from './AmbientScene';
import { MusicToggle } from './MusicToggle';
import { TypewriterLines } from './TypewriterLines';
import { generateFloatingItems } from '../utils/particles';
import { LOVE_LINES } from '../utils/constants';

interface CelebrationPageProps {
  playing: boolean;
  onToggleMusic: () => void;
  onRelive: () => void;
}

const NAME = 'HAJER';

export function CelebrationPage({
  playing,
  onToggleMusic,
  onRelive,
}: CelebrationPageProps) {
  const petals = useMemo(() => generateFloatingItems(20), []);
  const particles = useMemo(() => generateFloatingItems(35), []);

  return (
    <motion.div
      className="celebration-page scene-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="cinematic-gradient cinematic-gradient--warm" aria-hidden />
      <AmbientScene
        hearts={petals}
        particles={particles}
        variant="celebration"
      />

      <MusicToggle playing={playing} onToggle={onToggleMusic} />

      <motion.div
        className="celebration-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="birthday-greeting bloom-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
        >
          Happy Birthday My Love
        </motion.div>

        <div className="name-display name-display--cinematic">
          <div className="name-sparkles" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="name-sparkle" style={{ '--i': i } as CSSProperties} />
            ))}
          </div>
          {NAME.split('').map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              className="gradient-letter"
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: 0.5 + i * 0.12,
                duration: 0.7,
                type: 'spring',
                stiffness: 200,
                damping: 14,
              }}
            >
              {letter}
            </motion.span>
          ))}
          <motion.span
            className="heart-sparkle"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          >
            ❤️
          </motion.span>
        </div>

        <TypewriterLines lines={LOVE_LINES} startDelay={1.4} />
      </motion.div>

      <motion.div
        className="footer-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        Made with love for Hajer
        <span className="footer-heart">❤️</span>
      </motion.div>

      <motion.button
        type="button"
        className="relive-button glass-card"
        onClick={onRelive}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.7 }}
        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(251, 191, 36, 0.35)' }}
        whileTap={{ scale: 0.97 }}
      >
        Relive the Magic ✨
      </motion.button>
    </motion.div>
  );
}

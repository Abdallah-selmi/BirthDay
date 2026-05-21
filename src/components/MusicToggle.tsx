import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicToggleProps {
  playing: boolean;
  onToggle: () => void;
}

export function MusicToggle({ playing, onToggle }: MusicToggleProps) {
  return (
    <motion.button
      type="button"
      className={`music-toggle ${playing ? 'music-toggle--playing' : ''}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title={playing ? 'Pause music' : 'Play romantic music'}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <motion.span
        className="music-toggle__icon"
        animate={playing ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={playing ? { repeat: Infinity, duration: 1.2 } : {}}
      >
        {playing ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </motion.span>
      {playing && <span className="music-toggle__pulse" aria-hidden />}
    </motion.button>
  );
}

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      <motion.div
        className="loading-heart"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
      >
        ❤️
      </motion.div>
      <motion.p
        className="loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1] }}
        transition={{ duration: 1.5, times: [0, 0.3, 1] }}
      >
        Preparing your surprise...
      </motion.p>
    </motion.div>
  );
}

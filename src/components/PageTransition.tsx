import { motion } from 'framer-motion';

export function PageTransition() {
  return (
    <motion.div
      className="transition-overlay"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="transition-sparkle"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
        transition={{ duration: 1.2 }}
      />
    </motion.div>
  );
}

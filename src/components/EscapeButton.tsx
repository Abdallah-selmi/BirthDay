import { motion } from 'framer-motion';
import type { RefObject } from 'react';
import type React from 'react';
import type { Point } from '../utils/geometry';
import { springBouncy } from '../utils/constants';

interface EscapeButtonProps {
  buttonRef: RefObject<HTMLButtonElement | null>;
  position: Point;
  catchable: boolean;
  teaseMsg: string;
  onCatch: () => void;
}

export function EscapeButton({
  buttonRef,
  position,
  catchable,
  teaseMsg,
  onCatch,
}: EscapeButtonProps) {
  return (
    <>
      <motion.button
        ref={buttonRef as React.RefObject<HTMLButtonElement>}
        type="button"
        className={`escape-button ${catchable ? 'escape-button--catchable' : ''}`}
        onClick={catchable ? onCatch : undefined}
        animate={{
          left: position.x,
          top: position.y,
          scale: catchable ? [1, 1.06, 1] : 1,
        }}
        transition={{
          left: springBouncy,
          top: springBouncy,
          scale: catchable
            ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }
            : { duration: 0.2 },
        }}
        whileHover={catchable ? { scale: 1.1 } : {}}
        whileTap={catchable ? { scale: 0.92 } : {}}
        layout={false}
      >
        {catchable ? 'Catch Me Now 💕' : 'Click Me'}
      </motion.button>

      {teaseMsg && (
        <motion.div
          className="teasing-message"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          key={teaseMsg}
        >
          {teaseMsg}
        </motion.div>
      )}
    </>
  );
}

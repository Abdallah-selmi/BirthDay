import { motion } from 'framer-motion';
import type { RefObject } from 'react';
import type React from 'react';
import type { Point } from '../utils/geometry';
import { springEscape, springBouncy } from '../utils/constants';

interface EscapeButtonProps {
  buttonRef: RefObject<HTMLButtonElement | null>;
  position: Point;
  catchable: boolean;
  teaseMsg: string;
  dashKey: number;
  onCatch: () => void;
}

export function EscapeButton({
  buttonRef,
  position,
  catchable,
  teaseMsg,
  dashKey,
  onCatch,
}: EscapeButtonProps) {
  const moveTransition = catchable ? springBouncy : springEscape;

  return (
    <>
      <motion.button
        ref={buttonRef as React.RefObject<HTMLButtonElement>}
        type="button"
        className={`escape-button ${catchable ? 'escape-button--catchable' : 'escape-button--dashing'}`}
        onClick={catchable ? onCatch : undefined}
        animate={{
          left: position.x,
          top: position.y,
          scale: catchable ? [1, 1.08, 1] : [1, 1.12, 1],
          rotate: catchable ? 0 : [0, -8, 8, 0],
        }}
        transition={{
          left: moveTransition,
          top: moveTransition,
          scale: catchable
            ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
          rotate: catchable ? { duration: 0.2 } : { duration: 0.35 },
        }}
        data-dash={dashKey}
        whileHover={catchable ? { scale: 1.12 } : {}}
        whileTap={catchable ? { scale: 0.9 } : {}}
        layout={false}
      >
        <span className="escape-button__label">
          {catchable ? 'Catch Me Now 💕' : 'Click Me'}
        </span>
      </motion.button>

      {teaseMsg && (
        <motion.div
          className="teasing-message"
          initial={{ opacity: 0, scale: 0.75, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={springEscape}
          key={teaseMsg}
        >
          {teaseMsg}
        </motion.div>
      )}
    </>
  );
}

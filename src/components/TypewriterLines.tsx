import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TypewriterLinesProps {
  lines: readonly string[];
  startDelay?: number;
  charDelay?: number;
  linePause?: number;
}

export function TypewriterLines({
  lines,
  startDelay = 1200,
  charDelay = 35,
  linePause = 400,
}: TypewriterLinesProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started || lineIndex >= lines.length) return;

    const current = lines[lineIndex];
    if (charIndex < current.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), charDelay);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setLineIndex((l) => l + 1);
      setCharIndex(0);
    }, linePause);
    return () => clearTimeout(t);
  }, [started, lineIndex, charIndex, lines, charDelay, linePause]);

  return (
    <div className="romantic-message typewriter-block">
      {lines.map((line, i) => {
        if (i > lineIndex) return null;
        const visible =
          i < lineIndex ? line : line.slice(0, charIndex);
        const isActive = i === lineIndex;

        return (
          <motion.div
            key={line}
            className="message-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {visible}
            {isActive && started && charIndex < line.length && (
              <span className="typewriter-cursor">|</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

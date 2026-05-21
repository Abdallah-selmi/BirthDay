import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './components/LandingPage';
import { CelebrationPage } from './components/CelebrationPage';
import { PageTransition } from './components/PageTransition';
import { useRomanticAudio } from './hooks/useRomanticAudio';
import { useEscapeButton } from './hooks/useEscapeButton';
import { useCursorTrail } from './hooks/useCursorTrail';
import { useResponsive } from './hooks/useResponsive';
import type { PageState } from './utils/constants';
import { playHeartbeatSound, playSparkleSound } from './utils/audio';
import { spawnConfetti } from './utils/particles';

export default function App() {
  const [page, setPage] = useState<PageState>('loading');
  const [sessionKey, setSessionKey] = useState(0);
  const responsive = useResponsive();
  const audio = useRomanticAudio();

  const escapeConfig = useMemo(
    () => ({
      proximityThreshold: responsive.proximityThreshold,
      escapeDistanceMin: responsive.escapeDistanceMin,
      escapeDistanceMax: responsive.escapeDistanceMax,
      safePadding: responsive.safePadding,
      isTouch: responsive.isTouch,
    }),
    [
      responsive.proximityThreshold,
      responsive.escapeDistanceMin,
      responsive.escapeDistanceMax,
      responsive.safePadding,
      responsive.isTouch,
    ]
  );

  const escape = useEscapeButton({
    enabled: page === 'landing',
    config: escapeConfig,
  });

  useCursorTrail({
    active: page === 'landing',
    enabled: !responsive.isTouch && !responsive.isReducedMotion && !responsive.isLowPower,
  });

  useEffect(() => {
    if (page !== 'loading') return;
    const timer = setTimeout(() => setPage('landing'), 2200);
    return () => clearTimeout(timer);
  }, [page, sessionKey]);

  const handleCaught = useCallback(() => {
    if (!escape.catchable) return;

    playHeartbeatSound();
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 700);

    setTimeout(() => {
      playSparkleSound();
      setPage('transition');
      const cleanupConfetti = spawnConfetti(responsive.counts.confetti);

      setTimeout(() => {
        setPage('celebration');
        setTimeout(cleanupConfetti, 4000);
      }, 1200);
    }, 400);
  }, [escape.catchable, responsive.counts.confetti]);

  const handleRelive = useCallback(() => {
    playSparkleSound();
    setPage('loading');
    escape.reset();
    setSessionKey((k) => k + 1);
  }, [escape]);

  const handleToggleMusic = useCallback(() => {
    void audio.toggleMusic();
  }, [audio]);

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        {page === 'loading' && (
          <LoadingScreen key={`loading-${sessionKey}`} />
        )}

        {page === 'landing' && (
          <LandingPage
            key={`landing-${sessionKey}`}
            playing={audio.playing}
            onToggleMusic={handleToggleMusic}
            onCaught={handleCaught}
            screenShake={escape.screenShake}
            escape={escape}
            counts={responsive.counts}
            particleScale={responsive.particleScale}
            isReducedMotion={responsive.isReducedMotion}
          />
        )}

        {page === 'transition' && <PageTransition key="transition" />}

        {page === 'celebration' && (
          <CelebrationPage
            key={`celebration-${sessionKey}`}
            playing={audio.playing}
            onToggleMusic={handleToggleMusic}
            onRelive={handleRelive}
            counts={responsive.counts}
            particleScale={responsive.particleScale}
            isReducedMotion={responsive.isReducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

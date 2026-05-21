import { useEffect, useMemo, useState } from 'react';
import {
  buildResponsiveConfig,
  getViewportMetrics,
  throttleRaf,
  type ResponsiveConfig,
} from '../utils/breakpoints';

function detectTouch(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

function detectLowPower(): boolean {
  if (typeof window === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useResponsive(): ResponsiveConfig & { width: number; height: number } {
  const [metrics, setMetrics] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    const m = getViewportMetrics();
    return { width: m.width, height: m.height };
  });

  const [isTouch] = useState(detectTouch);
  const [isReducedMotion, setIsReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [isLowPower] = useState(detectLowPower);

  useEffect(() => {
    const update = throttleRaf(() => {
      const m = getViewportMetrics();
      setMetrics({ width: m.width, height: m.height });
    });

    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);

    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setIsReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const config = useMemo(
    () => buildResponsiveConfig(metrics.width, isTouch, isReducedMotion, isLowPower),
    [metrics.width, isTouch, isReducedMotion, isLowPower]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.tier = config.tier;
    root.dataset.breakpoint = config.breakpoint;
    root.style.setProperty('--particle-scale', String(config.particleScale));
    root.style.setProperty('--safe-padding', `${config.safePadding}px`);
    root.style.setProperty('--vh', `${metrics.height * 0.01}px`);
  }, [config.tier, config.breakpoint, config.particleScale, config.safePadding, metrics.height]);

  return {
    ...config,
    width: metrics.width,
    height: metrics.height,
  };
}

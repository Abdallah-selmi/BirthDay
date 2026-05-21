import { useCallback, useEffect, useRef, useState } from 'react';
import {
  computeEscapePosition,
  distance,
  getInitialButtonPosition,
  getRectCenter,
  clampPosition,
  type Point,
  type EscapeOptions,
} from '../utils/geometry';
import { ESCAPE_MESSAGES, MAX_ESCAPES } from '../utils/constants';
import { playClickSound } from '../utils/audio';
import { throttleRaf, type ResponsiveConfig } from '../utils/breakpoints';

const ESCAPE_COOLDOWN_MS = 450;

interface UseEscapeButtonOptions {
  enabled: boolean;
  config: Pick<
    ResponsiveConfig,
    | 'proximityThreshold'
    | 'escapeDistanceMin'
    | 'escapeDistanceMax'
    | 'safePadding'
    | 'isTouch'
  >;
}

export function useEscapeButton({ enabled, config }: UseEscapeButtonOptions) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [escapeCount, setEscapeCount] = useState(0);
  const [catchable, setCatchable] = useState(false);
  const [teaseMsg, setTeaseMsg] = useState('');
  const [screenShake, setScreenShake] = useState(false);
  const lastEscapeRef = useRef(0);
  const teaseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const configRef = useRef(config);
  configRef.current = config;

  const escapeOpts = useCallback((): EscapeOptions => ({
    escapeDistanceMin: configRef.current.escapeDistanceMin,
    escapeDistanceMax: configRef.current.escapeDistanceMax,
    safePadding: configRef.current.safePadding,
  }), []);

  const initPosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width || 150;
    const h = rect.height || 48;
    setPosition(
      getInitialButtonPosition(w, h, configRef.current.safePadding)
    );
  }, []);

  const clampCurrentPosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition((prev) =>
      clampPosition(prev.x, prev.y, rect.width, rect.height, configRef.current.safePadding)
    );
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const t = requestAnimationFrame(() => initPosition());

    const onResize = throttleRaf(() => clampCurrentPosition());
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, [enabled, initPosition, clampCurrentPosition]);

  const showTease = useCallback((msg: string) => {
    if (teaseTimeoutRef.current) clearTimeout(teaseTimeoutRef.current);
    setTeaseMsg(msg);
    teaseTimeoutRef.current = setTimeout(() => setTeaseMsg(''), 1600);
  }, []);

  const triggerEscape = useCallback(
    (cursor: Point) => {
      const el = buttonRef.current;
      if (!el || catchable || escapeCount >= MAX_ESCAPES) return;

      const now = Date.now();
      if (now - lastEscapeRef.current < ESCAPE_COOLDOWN_MS) return;

      const rect = el.getBoundingClientRect();
      const center = getRectCenter(rect);
      const threshold = configRef.current.proximityThreshold;

      if (distance(cursor, center) >= threshold) return;

      lastEscapeRef.current = now;
      const nextCount = escapeCount + 1;
      setEscapeCount(nextCount);
      setPosition(computeEscapePosition(cursor, rect, escapeOpts()));
      showTease(ESCAPE_MESSAGES[nextCount - 1] ?? '');
      playClickSound();

      if (nextCount >= MAX_ESCAPES) {
        setCatchable(true);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 600);
      }
    },
    [catchable, escapeCount, showTease, escapeOpts]
  );

  const onPointer = useCallback(
    throttleRaf((clientX: number, clientY: number) => {
      triggerEscape({ x: clientX, y: clientY });
    }),
    [triggerEscape]
  );

  useEffect(() => {
    if (!enabled || catchable) return;

    const onPointerMove = (e: PointerEvent) => {
      onPointer(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) onPointer(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) onPointer(touch.clientX, touch.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [enabled, catchable, onPointer]);

  const reset = useCallback(() => {
    setEscapeCount(0);
    setCatchable(false);
    setTeaseMsg('');
    setScreenShake(false);
    lastEscapeRef.current = 0;
    requestAnimationFrame(() => initPosition());
  }, [initPosition]);

  useEffect(() => {
    return () => {
      if (teaseTimeoutRef.current) clearTimeout(teaseTimeoutRef.current);
    };
  }, []);

  return {
    buttonRef,
    position,
    escapeCount,
    catchable,
    teaseMsg,
    screenShake,
    reset,
    initPosition,
  };
}

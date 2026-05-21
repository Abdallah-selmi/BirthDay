import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PROXIMITY_THRESHOLD,
  computeEscapePosition,
  distance,
  getInitialButtonPosition,
  getRectCenter,
  type Point,
} from '../utils/geometry';
import { ESCAPE_MESSAGES, MAX_ESCAPES } from '../utils/constants';
import { playClickSound } from '../utils/audio';

const ESCAPE_COOLDOWN_MS = 450;

export function useEscapeButton(enabled: boolean) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [escapeCount, setEscapeCount] = useState(0);
  const [catchable, setCatchable] = useState(false);
  const [teaseMsg, setTeaseMsg] = useState('');
  const [screenShake, setScreenShake] = useState(false);
  const lastEscapeRef = useRef(0);
  const initializedRef = useRef(false);
  const teaseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const initPosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width || 160;
    const h = rect.height || 52;
    setPosition(getInitialButtonPosition(w, h));
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const t = requestAnimationFrame(() => initPosition());
    const onResize = () => {
      setPosition((prev) => {
        const el = buttonRef.current;
        if (!el) return prev;
        const rect = el.getBoundingClientRect();
        return getInitialButtonPosition(rect.width, rect.height);
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, initPosition]);

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
      if (distance(cursor, center) >= PROXIMITY_THRESHOLD) return;

      lastEscapeRef.current = now;
      const nextCount = escapeCount + 1;
      setEscapeCount(nextCount);
      setPosition(computeEscapePosition(cursor, rect));
      showTease(ESCAPE_MESSAGES[nextCount - 1] ?? '');
      playClickSound();

      if (nextCount >= MAX_ESCAPES) {
        setCatchable(true);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 600);
      }
    },
    [catchable, escapeCount, showTease]
  );

  useEffect(() => {
    if (!enabled || catchable) return;

    const onPointerMove = (e: PointerEvent) => {
      triggerEscape({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [enabled, catchable, triggerEscape]);

  const reset = useCallback(() => {
    setEscapeCount(0);
    setCatchable(false);
    setTeaseMsg('');
    setScreenShake(false);
    lastEscapeRef.current = 0;
    initializedRef.current = false;
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

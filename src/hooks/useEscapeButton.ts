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

/** After escape, cursor must leave this zone before next escape (game hysteresis) */
const LEAVE_ZONE_MULTIPLIER = 1.75;

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
  const [dashKey, setDashKey] = useState(0);
  const [catchable, setCatchable] = useState(false);
  const [teaseMsg, setTeaseMsg] = useState('');
  const [screenShake, setScreenShake] = useState(false);

  const positionRef = useRef(position);
  positionRef.current = position;

  const escapeCountRef = useRef(0);
  const catchableRef = useRef(false);
  const armedRef = useRef(true);
  const configRef = useRef(config);
  configRef.current = config;

  const teaseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const escapeOpts = useCallback(
    (attempt: number): EscapeOptions => ({
      escapeDistanceMin: configRef.current.escapeDistanceMin,
      escapeDistanceMax: configRef.current.escapeDistanceMax,
      safePadding: configRef.current.safePadding,
      escapeAttempt: attempt,
    }),
    []
  );

  const initPosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width || 150;
    const h = rect.height || 48;
    const pos = getInitialButtonPosition(w, h, configRef.current.safePadding);
    positionRef.current = pos;
    setPosition(pos);
  }, []);

  const clampCurrentPosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pos = clampPosition(
      positionRef.current.x,
      positionRef.current.y,
      rect.width,
      rect.height,
      configRef.current.safePadding
    );
    positionRef.current = pos;
    setPosition(pos);
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

  const triggerEscape = useCallback((cursor: Point) => {
    const el = buttonRef.current;
    if (!el || catchableRef.current || escapeCountRef.current >= MAX_ESCAPES) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const center = getRectCenter(rect);
    const threshold = configRef.current.proximityThreshold;
    const dist = distance(cursor, center);

    // Réarmer quand le curseur/doigt s'éloigne assez
    if (dist > threshold * LEAVE_ZONE_MULTIPLIER) {
      armedRef.current = true;
      return;
    }

    if (!armedRef.current || dist >= threshold) return;

    armedRef.current = false;
    const nextCount = escapeCountRef.current + 1;
    escapeCountRef.current = nextCount;

    const newPos = computeEscapePosition(
      cursor,
      positionRef.current,
      w,
      h,
      escapeOpts(nextCount)
    );

    positionRef.current = newPos;
    setPosition(newPos);
    setEscapeCount(nextCount);
    setDashKey((k) => k + 1);
    showTease(ESCAPE_MESSAGES[nextCount - 1] ?? '');
    playClickSound();

    if (nextCount >= MAX_ESCAPES) {
      catchableRef.current = true;
      setCatchable(true);
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
    }
  }, [showTease, escapeOpts]);

  useEffect(() => {
    if (!enabled || catchable) return;

    const onPointerMove = (e: PointerEvent) => {
      triggerEscape({ x: e.clientX, y: e.clientY });
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) triggerEscape({ x: touch.clientX, y: touch.clientY });
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) triggerEscape({ x: touch.clientX, y: touch.clientY });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [enabled, catchable, triggerEscape]);

  const reset = useCallback(() => {
    escapeCountRef.current = 0;
    catchableRef.current = false;
    armedRef.current = true;
    setEscapeCount(0);
    setCatchable(false);
    setTeaseMsg('');
    setScreenShake(false);
    setDashKey(0);
    requestAnimationFrame(() => initPosition());
  }, [initPosition]);

  useEffect(() => {
    catchableRef.current = catchable;
  }, [catchable]);

  useEffect(() => {
    return () => {
      if (teaseTimeoutRef.current) clearTimeout(teaseTimeoutRef.current);
    };
  }, []);

  return {
    buttonRef,
    position,
    escapeCount,
    dashKey,
    catchable,
    teaseMsg,
    screenShake,
    reset,
    initPosition,
  };
}

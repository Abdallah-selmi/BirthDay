export const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export type DeviceTier =
  | 'mobile-small'
  | 'mobile'
  | 'tablet'
  | 'laptop'
  | 'desktop'
  | 'ultrawide';

export interface ViewportMetrics {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
}

export interface AdaptiveCounts {
  hearts: number;
  particles: number;
  petals: number;
  confetti: number;
}

export interface ResponsiveConfig {
  tier: DeviceTier;
  breakpoint: BreakpointKey;
  proximityThreshold: number;
  escapeDistanceMin: number;
  escapeDistanceMax: number;
  safePadding: number;
  particleScale: number;
  counts: AdaptiveCounts;
  isTouch: boolean;
  isReducedMotion: boolean;
  isLowPower: boolean;
}

export function getDeviceTier(width: number): DeviceTier {
  if (width < BREAKPOINTS.sm) return 'mobile-small';
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  if (width < BREAKPOINTS.xl) return 'laptop';
  if (width < BREAKPOINTS['2xl']) return 'desktop';
  return 'ultrawide';
}

export function getBreakpointKey(width: number): BreakpointKey {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
}

export function getViewportMetrics(): ViewportMetrics {
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
    offsetTop: vv?.offsetTop ?? 0,
    offsetLeft: vv?.offsetLeft ?? 0,
  };
}

export function getProximityThreshold(width: number): number {
  if (width < BREAKPOINTS.sm) return 90;
  if (width < BREAKPOINTS.md) return 100;
  if (width < BREAKPOINTS.lg) return 110;
  return 120;
}

export function getEscapeDistance(width: number): { min: number; max: number } {
  const scale = Math.min(1, width / BREAKPOINTS.lg);
  return {
    min: 80 + scale * 50,
    max: 120 + scale * 80,
  };
}

export function getSafePadding(width: number): number {
  if (width < BREAKPOINTS.sm) return 12;
  if (width < BREAKPOINTS.md) return 16;
  if (width < BREAKPOINTS.lg) return 20;
  return 24;
}

export function getParticleScale(width: number): number {
  if (width < BREAKPOINTS.sm) return 0.65;
  if (width < BREAKPOINTS.md) return 0.8;
  if (width < BREAKPOINTS.lg) return 0.9;
  if (width < BREAKPOINTS['2xl']) return 1;
  return 1.15;
}

export function getAdaptiveCounts(
  tier: DeviceTier,
  reducedMotion: boolean
): AdaptiveCounts {
  if (reducedMotion) {
    return { hearts: 4, particles: 12, petals: 6, confetti: 25 };
  }

  switch (tier) {
    case 'mobile-small':
      return { hearts: 6, particles: 18, petals: 8, confetti: 35 };
    case 'mobile':
      return { hearts: 8, particles: 28, petals: 12, confetti: 45 };
    case 'tablet':
      return { hearts: 10, particles: 36, petals: 14, confetti: 55 };
    case 'laptop':
      return { hearts: 12, particles: 44, petals: 16, confetti: 60 };
    case 'desktop':
      return { hearts: 14, particles: 50, petals: 18, confetti: 65 };
    case 'ultrawide':
      return { hearts: 16, particles: 58, petals: 22, confetti: 70 };
    default:
      return { hearts: 10, particles: 36, petals: 14, confetti: 55 };
  }
}

export function buildResponsiveConfig(
  width: number,
  isTouch: boolean,
  isReducedMotion: boolean,
  isLowPower: boolean
): ResponsiveConfig {
  const tier = getDeviceTier(width);
  const { min, max } = getEscapeDistance(width);

  return {
    tier,
    breakpoint: getBreakpointKey(width),
    proximityThreshold: getProximityThreshold(width),
    escapeDistanceMin: min,
    escapeDistanceMax: max,
    safePadding: getSafePadding(width),
    particleScale: getParticleScale(width),
    counts: getAdaptiveCounts(tier, isReducedMotion),
    isTouch,
    isReducedMotion,
    isLowPower,
  };
}

/** Throttle helper for resize / pointer handlers */
export function throttleRaf<T extends (...args: never[]) => void>(fn: T): T {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const wrapped = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (lastArgs) fn(...lastArgs);
      lastArgs = null;
    });
  }) as T;

  return wrapped;
}

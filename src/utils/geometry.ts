import {
  getEscapeDistance,
  getProximityThreshold,
  getSafePadding,
  getViewportMetrics,
} from './breakpoints';

export interface Point {
  x: number;
  y: number;
}

export interface EscapeOptions {
  proximityThreshold?: number;
  escapeDistanceMin?: number;
  escapeDistanceMax?: number;
  safePadding?: number;
  /** 1-based escape attempt — each jump goes farther */
  escapeAttempt?: number;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getRectCenter(rect: DOMRect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getLayoutBounds(padding: number) {
  const { width, height, offsetTop, offsetLeft } = getViewportMetrics();
  return {
    minX: offsetLeft + padding,
    minY: offsetTop + padding,
    maxX: offsetLeft + width - padding,
    maxY: offsetTop + height - padding,
    width,
    height,
    offsetTop,
    offsetLeft,
  };
}

export function clampPosition(
  x: number,
  y: number,
  btnWidth: number,
  btnHeight: number,
  padding?: number
): Point {
  const pad = padding ?? getSafePadding(getViewportMetrics().width);
  const { minX, minY, maxX, maxY } = getLayoutBounds(pad);

  const maxPosX = maxX - btnWidth;
  const maxPosY = maxY - btnHeight;

  return {
    x: Math.min(Math.max(minX, x), Math.max(minX, maxPosX)),
    y: Math.min(Math.max(minY, y), Math.max(minY, maxPosY)),
  };
}

function centerFromTopLeft(pos: Point, w: number, h: number): Point {
  return { x: pos.x + w / 2, y: pos.y + h / 2 };
}

/** Game-like escape: big jump, always far from cursor, prefers opposite side of screen */
export function computeEscapePosition(
  cursor: Point,
  currentTopLeft: Point,
  btnWidth: number,
  btnHeight: number,
  options: EscapeOptions = {}
): Point {
  const bounds = getLayoutBounds(options.safePadding ?? getSafePadding(getViewportMetrics().width));
  const vw = bounds.width;
  const vh = bounds.height;
  const { min: defaultMin, max: defaultMax } = getEscapeDistance(vw);

  const attempt = options.escapeAttempt ?? 1;
  const attemptBoost = (attempt - 1) * 35;
  const escapeMin = (options.escapeDistanceMin ?? defaultMin) + attemptBoost;
  const escapeMax = (options.escapeDistanceMax ?? defaultMax) + attemptBoost;

  const center = centerFromTopLeft(currentTopLeft, btnWidth, btnHeight);
  const isNarrow = vw < 480;
  const minSeparationFromCursor = isNarrow
    ? Math.max(72, Math.min(vw, vh) * 0.2)
    : Math.max(100, Math.min(vw, vh) * 0.26);
  const minTravelFromCurrent = isNarrow
    ? Math.max(48, Math.min(vw, vh) * 0.12)
    : Math.max(72, Math.min(vw, vh) * 0.15);

  let best: Point | null = null;
  let bestScore = -1;

  const awayAngle = Math.atan2(center.y - cursor.y, center.x - cursor.x);

  for (let i = 0; i < 12; i++) {
    const angle =
      i === 0
        ? awayAngle
        : awayAngle + (Math.random() - 0.5) * Math.PI * 0.9;
    const dist = escapeMin + Math.random() * (escapeMax - escapeMin);

    let tx = center.x + Math.cos(angle) * dist - btnWidth / 2;
    let ty = center.y + Math.sin(angle) * dist - btnHeight / 2;

    const candidate = clampPosition(tx, ty, btnWidth, btnHeight, options.safePadding);
    const candCenter = centerFromTopLeft(candidate, btnWidth, btnHeight);
    const distCursor = distance(candCenter, cursor);
    const travel = distance(candCenter, center);

    if (distCursor < minSeparationFromCursor || travel < minTravelFromCurrent) {
      continue;
    }

    const score = distCursor + travel * 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (best) return best;

  // Fallback: téléportation vers le quadrant opposé au doigt/souris
  const relX = (cursor.x - bounds.offsetLeft) / vw;
  const relY = (cursor.y - bounds.offsetTop) / vh;
  const jumpX =
    relX < 0.5
      ? bounds.minX + (bounds.maxX - bounds.minX - btnWidth) * 0.82
      : bounds.minX + (bounds.maxX - bounds.minX - btnWidth) * 0.05;
  const jumpY =
    relY < 0.5
      ? bounds.minY + (bounds.maxY - bounds.minY - btnHeight) * 0.72
      : bounds.minY + (bounds.maxY - bounds.minY - btnHeight) * 0.12;

  return clampPosition(jumpX, jumpY, btnWidth, btnHeight, options.safePadding);
}

export function getInitialButtonPosition(
  btnWidth: number,
  btnHeight: number,
  padding?: number
): Point {
  const { width, height, offsetTop, offsetLeft } = getViewportMetrics();
  const pad = padding ?? getSafePadding(width);
  const x = offsetLeft + width / 2 - btnWidth / 2;
  const y = offsetTop + height / 2 - btnHeight / 2 + Math.min(48, height * 0.08);
  return clampPosition(x, y, btnWidth, btnHeight, pad);
}

export function getDefaultProximityThreshold(): number {
  return getProximityThreshold(getViewportMetrics().width);
}

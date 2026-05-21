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

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EscapeOptions {
  proximityThreshold?: number;
  escapeDistanceMin?: number;
  escapeDistanceMax?: number;
  safePadding?: number;
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

/** Smart escape: place button away from cursor, inside viewport + safe areas */
export function computeEscapePosition(
  cursor: Point,
  buttonRect: DOMRect,
  options: EscapeOptions = {}
): Point {
  const vw = getViewportMetrics().width;
  const { min: defaultMin, max: defaultMax } = getEscapeDistance(vw);

  const escapeMin = options.escapeDistanceMin ?? defaultMin;
  const escapeMax = options.escapeDistanceMax ?? defaultMax;
  const padding = options.safePadding ?? getSafePadding(vw);

  const center = getRectCenter(buttonRect);
  const awayAngle = Math.atan2(center.y - cursor.y, center.x - cursor.x);
  const escapeDistance = escapeMin + Math.random() * (escapeMax - escapeMin);

  let targetX = center.x + Math.cos(awayAngle) * escapeDistance - buttonRect.width / 2;
  let targetY = center.y + Math.sin(awayAngle) * escapeDistance - buttonRect.height / 2;

  const jitter = Math.min(40, vw * 0.06);
  targetX += (Math.random() - 0.5) * jitter * 2;
  targetY += (Math.random() - 0.5) * jitter * 2;

  return clampPosition(targetX, targetY, buttonRect.width, buttonRect.height, padding);
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

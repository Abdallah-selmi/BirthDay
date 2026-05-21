export const PROXIMITY_THRESHOLD = 120;

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

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getRectCenter(rect: DOMRect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  padding = 20
): Point {
  const maxX = window.innerWidth - width - padding;
  const maxY = window.innerHeight - height - padding;
  return {
    x: Math.min(Math.max(padding, x), Math.max(padding, maxX)),
    y: Math.min(Math.max(padding, y), Math.max(padding, maxY)),
  };
}

/** Smart escape: place button away from cursor, inside viewport */
export function computeEscapePosition(
  cursor: Point,
  buttonRect: DOMRect,
  padding = 24
): Point {
  const center = getRectCenter(buttonRect);
  const awayAngle = Math.atan2(center.y - cursor.y, center.x - cursor.x);
  const escapeDistance = 140 + Math.random() * 80;

  let targetX = center.x + Math.cos(awayAngle) * escapeDistance - buttonRect.width / 2;
  let targetY = center.y + Math.sin(awayAngle) * escapeDistance - buttonRect.height / 2;

  // Add slight randomness so movement feels alive
  targetX += (Math.random() - 0.5) * 60;
  targetY += (Math.random() - 0.5) * 60;

  return clampPosition(targetX, targetY, buttonRect.width, buttonRect.height, padding);
}

export function getInitialButtonPosition(
  width: number,
  height: number
): Point {
  const x = window.innerWidth / 2 - width / 2;
  const y = window.innerHeight / 2 + 40;
  return clampPosition(x, y, width, height);
}

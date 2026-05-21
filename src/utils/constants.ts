export type PageState = 'loading' | 'landing' | 'transition' | 'celebration';

export const ESCAPE_MESSAGES = [
  'Nooo 😜',
  'Catch me first ❤️',
  'Almost there 👀',
  'Still running! 🏃‍♀️',
  'You are so close 💫',
  'One last try my love 💕',
] as const;

/** Proximity escapes before the button becomes catchable (7th = click to win) */
export const MAX_ESCAPES = 6;

export const LOVE_LINES = [
  'You are the most beautiful thing that ever happened to me.',
  'Every moment with you is pure magic and endless joy.',
  'May your smile always shine brighter than a thousand stars.',
  'Happy Birthday my precious love, today and forever.',
] as const;

export const springBouncy = { type: 'spring' as const, stiffness: 380, damping: 22, mass: 0.8 };
export const springSoft = { type: 'spring' as const, stiffness: 120, damping: 18, mass: 1 };

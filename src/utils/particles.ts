export interface FloatingItem {
  id: number;
  left: number;
  top?: number;
  duration: number;
  delay: number;
  size?: number;
  opacity?: number;
}

export function generateFloatingItems(count: number): FloatingItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 6 + Math.random() * 5,
    delay: Math.random() * 3,
    size: 0.6 + Math.random() * 0.8,
    opacity: 0.3 + Math.random() * 0.5,
  }));
}

const CONFETTI_COLORS = ['#f472b6', '#ec4899', '#fbbf24', '#fcd34d', '#fda4af', '#e879f9'];

export function spawnConfetti(count = 60): () => void {
  const elements: HTMLDivElement[] = [];
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.textContent = i % 3 === 0 ? '❤️' : i % 3 === 1 ? '✨' : '🌹';
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = '-24px';
    el.style.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.fontSize = `${18 + Math.random() * 22}px`;
    el.style.setProperty('--tx', `${Math.random() * 240 - 120}px`);
    el.style.setProperty('--ty', '110vh');
    el.style.setProperty('--rot', `${Math.random() * 720}deg`);
    el.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    document.body.appendChild(el);
    elements.push(el);
    timeouts.push(setTimeout(() => el.remove(), 3500));
  }

  return () => {
    timeouts.forEach(clearTimeout);
    elements.forEach((el) => el.remove());
  };
}

import { useEffect, useRef } from 'react';

export function useCursorTrail(active: boolean) {
  const lastSpawn = useRef(0);

  useEffect(() => {
    if (!active) return;

    const onMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - lastSpawn.current < 80) return;
      lastSpawn.current = now;

      const heart = document.createElement('span');
      heart.className = 'cursor-trail';
      heart.textContent = Math.random() > 0.5 ? '❤️' : '✨';
      heart.style.left = `${e.clientX}px`;
      heart.style.top = `${e.clientY}px`;
      heart.style.setProperty('--rot', `${Math.random() * 360}deg`);
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 900);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [active]);
}

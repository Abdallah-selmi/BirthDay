/** Local royalty-free track (Pachelbel Canon in D — Archive.org, public domain) */
export const ROMANTIC_MUSIC_URL = '/music/romantic-piano.mp3';

let audioContext: AudioContext | null = null;
let audioUnlocked = false;

export function unlockAudioContext(): void {
  if (typeof window === 'undefined') return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    if (!audioContext) {
      audioContext = new Ctx();
    }
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
    audioUnlocked = true;
  } catch {
    /* ignore */
  }
}

function getAudioContext(): AudioContext | null {
  if (!audioUnlocked) {
    unlockAudioContext();
  }
  if (!audioContext) return null;
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = frequency;

  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.001), start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playClickSound() {
  unlockAudioContext();
  playTone(520, 0.08, 'sine', 0.15);
  playTone(780, 0.06, 'sine', 0.08, 0.04);
}

export function playSparkleSound() {
  unlockAudioContext();
  playTone(880, 0.1, 'sine', 0.12);
  playTone(1100, 0.12, 'sine', 0.1, 0.06);
  playTone(1320, 0.14, 'sine', 0.07, 0.12);
}

export function playHeartbeatSound() {
  unlockAudioContext();
  const ctx = getAudioContext();
  if (!ctx) return;

  const beat = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, time);
    osc.frequency.exponentialRampToValueAtTime(55, time + 0.12);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.4, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    osc.start(time);
    osc.stop(time + 0.2);
  };

  const t = ctx.currentTime;
  beat(t);
  beat(t + 0.22);
  beat(t + 0.55);
  beat(t + 0.77);
}

let fadeIntervalId: number | null = null;

export function cancelVolumeFade() {
  if (fadeIntervalId !== null) {
    clearInterval(fadeIntervalId);
    fadeIntervalId = null;
  }
}

export async function fadeAudioVolume(
  audio: HTMLAudioElement,
  target: number,
  durationMs = 600
): Promise<void> {
  cancelVolumeFade();
  const start = audio.volume;
  const steps = 24;
  const stepTime = durationMs / steps;
  const delta = (target - start) / steps;

  return new Promise((resolve) => {
    let step = 0;
    fadeIntervalId = window.setInterval(() => {
      step += 1;
      if (!audio.paused || target > 0) {
        audio.volume = Math.min(1, Math.max(0, start + delta * step));
      }
      if (step >= steps) {
        cancelVolumeFade();
        audio.volume = target;
        resolve();
      }
    }, stepTime);
  });
}

export function waitForAudioReady(audio: HTMLAudioElement): Promise<void> {
  if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Audio failed to load'));
    };
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onReady);
      audio.removeEventListener('error', onError);
    };
    audio.addEventListener('canplaythrough', onReady, { once: true });
    audio.addEventListener('error', onError, { once: true });
    audio.load();
  });
}

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ROMANTIC_MUSIC_URL,
  cancelVolumeFade,
  fadeAudioVolume,
  unlockAudioContext,
  waitForAudioReady,
} from '../utils/audio';

const TARGET_VOLUME = 0.35;
const FADE_MS = 800;

export function useRomanticAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const startingRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(ROMANTIC_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    audioRef.current = audio;
    void audio.load();

    return () => {
      cancelVolumeFade();
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const unlockAudio = useCallback(() => {
    unlockAudioContext();
    setUnlocked(true);
  }, []);

  const startMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || startingRef.current) return;

    startingRef.current = true;
    unlockAudioContext();

    try {
      await waitForAudioReady(audio);
      cancelVolumeFade();
      audio.volume = 0;
      await audio.play();
      setPlaying(true);
      await fadeAudioVolume(audio, TARGET_VOLUME, FADE_MS);
    } catch (err) {
      console.warn('Music playback failed:', err);
      setPlaying(false);
    } finally {
      startingRef.current = false;
    }
  }, []);

  const stopMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaying(false);
    cancelVolumeFade();
    try {
      await fadeAudioVolume(audio, 0, FADE_MS);
    } catch {
      audio.volume = 0;
    }
    audio.pause();
  }, []);

  const toggleMusic = useCallback(async () => {
    unlockAudio();
    if (playing) {
      await stopMusic();
    } else {
      await startMusic();
    }
  }, [playing, startMusic, stopMusic, unlockAudio]);

  useEffect(() => {
    const onFirstInteraction = (e: PointerEvent | KeyboardEvent) => {
      unlockAudio();

      const target = e.target;
      if (target instanceof Element && target.closest('.music-toggle')) {
        return;
      }

      void startMusic();
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
  }, [unlockAudio, startMusic]);

  return {
    playing,
    unlocked,
    toggleMusic,
    startMusic,
    stopMusic,
    unlockAudio,
    audioRef,
  };
}

'use client';

import { useCallback, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';

type SoundType = 'success' | 'error' | 'notification' | 'click' | 'celebration';

const SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
  success: { frequency: 880, duration: 150, type: 'sine' },
  error: { frequency: 220, duration: 300, type: 'square' },
  notification: { frequency: 660, duration: 100, type: 'sine' },
  click: { frequency: 440, duration: 50, type: 'sine' },
  celebration: { frequency: 1046.5, duration: 200, type: 'sine' },
};

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      try {
        const ctx = getAudioContext();
        const { frequency, duration, type: waveType } = SOUND_FREQUENCIES[type];

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);

        if (type === 'celebration') {
          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1318.5, ctx.currentTime);
            gain2.gain.setValueAtTime(0.1, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.2);
          }, 150);
        }
      } catch {
        // AudioContext may not be available in all environments — fail silently
      }
    },
    [getAudioContext],
  );

  return { play };
}

'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Celebration({ trigger, onComplete }: CelebrationProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        onComplete?.();
      }
    };

    requestAnimationFrame(frame);
  }, [trigger, onComplete]);

  return null;
}

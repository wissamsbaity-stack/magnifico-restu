"use client";

import { useCallback, useRef } from "react";

export function useOrderNotificationSound() {
  const contextRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      if (!contextRef.current) {
        contextRef.current = new AudioCtx();
      }

      const ctx = contextRef.current;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      const tone = (frequency: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, start);
        osc.connect(gain);
        osc.start(start);
        osc.stop(start + duration);
      };

      tone(880, now, 0.12);
      tone(1174.66, now + 0.14, 0.18);
    } catch {
      // Audio may be blocked until user interaction.
    }
  }, []);

  return { play };
}

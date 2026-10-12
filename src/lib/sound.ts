"use client";

// Small synthesized feedback sounds — no audio files needed.
let ctx: AudioContext | null = null;

export function soundEnabled() {
  try {
    return localStorage.getItem("sound") !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem("sound", on ? "on" : "off");
  } catch {}
}

function tone(freqs: number[], dur = 0.12, type: OscillatorType = "sine", gap = 0.09) {
  if (!soundEnabled()) return;
  try {
    ctx ??= new AudioContext();
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = type;
      osc.frequency.value = f;
      const start = t0 + i * gap;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  } catch {}
}

export const sounds = {
  correct: () => tone([660, 880], 0.16, "triangle"),
  wrong: () => tone([220, 165], 0.2, "square", 0.12),
  complete: () => tone([523, 659, 784, 1047], 0.22, "triangle", 0.11),
};

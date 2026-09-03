let audioContext: AudioContext | null = null;
let completionAlertInterval: number | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    audioContext ??= new AudioCtx();
    return audioContext;
  } catch {
    return null;
  }
}

/** Resume the shared context while handling a user gesture. */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
}

function playCompletionChimeOnce(): void {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const startTime = ctx.currentTime;

    notes.forEach((frequency, index) => {
      const start = startTime + index * 0.15;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.65);
    });
  } catch {
    // Audio can become unavailable when the browser suspends the page.
  }
}

export function startTimerCompletionAlert(): void {
  if (completionAlertInterval !== null) return;

  unlockAudio();
  playCompletionChimeOnce();
  completionAlertInterval = window.setInterval(playCompletionChimeOnce, 1500);
}

export function stopTimerCompletionAlert(): void {
  if (completionAlertInterval !== null) {
    window.clearInterval(completionAlertInterval);
    completionAlertInterval = null;
  }
}

export function playTickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== "running") return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // ignore
  }
}

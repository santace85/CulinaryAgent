const SECONDS_PATTERN = /\b(\d+(?:\.\d+)?)\s*(seconds?|secs?)\b/gi;

export function formatInstructionDurations(instruction: string): string {
  return instruction.replace(SECONDS_PATTERN, (match, value: string) => {
    const seconds = Number(value);
    if (seconds < 60) return match;

    const minutes = Number((seconds / 60).toFixed(2));
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  });
}

/**
 * Execution safeguards to prevent runaway flows
 */

const MAX_STEPS = 100;
const MAX_TOTAL_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_SINGLE_DELAY_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface GuardStats {
  stepCount: number;
  totalDelayMs: number;
}

export const checkExecutionLimits = (stats: GuardStats, nextDelayMs: number = 0): { allowed: boolean; reason?: string } => {
  // Check max steps
  if (stats.stepCount >= MAX_STEPS) {
    return { allowed: false, reason: `Execution exceeded maximum limit of ${MAX_STEPS} steps` };
  }

  // Check single delay limit
  if (nextDelayMs > MAX_SINGLE_DELAY_MS) {
    return { allowed: false, reason: `Single delay of ${Math.round(nextDelayMs / 3600000)}h exceeds maximum limit of 6h` };
  }

  // Check total delay limit
  if (stats.totalDelayMs + nextDelayMs > MAX_TOTAL_DELAY_MS) {
    return { allowed: false, reason: "Total execution delay exceeds maximum limit of 24 hours" };
  }

  return { allowed: true };
};

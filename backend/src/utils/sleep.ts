/**
 * Sleep utility for implementing delays in automation flows
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Convert delay configuration to milliseconds
 * @param value - Numeric value of the delay
 * @param unit - Unit of time (minutes, hours, days)
 * @returns Milliseconds
 */
export const convertToMilliseconds = (
  value: number,
  unit: "minutes" | "hours" | "days",
): number => {
  switch (unit) {
    case "minutes":
      return value * 60 * 1000;
    case "hours":
      return value * 60 * 60 * 1000;
    case "days":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
};

/**
 * Calculate delay until a specific datetime
 * @param targetDate - Target date/time to wait until
 * @returns Milliseconds until target date
 */
export const calculateDelayUntil = (targetDate: Date): number => {
  const now = new Date();
  const delay = targetDate.getTime() - now.getTime();

  if (delay < 0) {
    throw new Error("Target date is in the past");
  }

  return delay;
};

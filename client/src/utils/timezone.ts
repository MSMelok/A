// Central Time conversion utilities using proper timezone handling

export function convertToUTC(centralTime: Date): Date {
  // Create a new date in UTC that represents the same moment
  return new Date(centralTime.toISOString());
}

export function convertFromUTC(utcTime: string | Date): Date {
  const utc = typeof utcTime === 'string' ? new Date(utcTime) : utcTime;
  return new Date(utc.toLocaleString("en-US", { timeZone: "America/Chicago" }));
}

export function convertToCentralTime(utcTime: string | Date): Date {
  return convertFromUTC(utcTime);
}

export function formatCentralTime(utcTime: string | Date): string {
  const centralTime = convertFromUTC(utcTime);
  return centralTime.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

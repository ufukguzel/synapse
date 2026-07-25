export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export const formatXp = (xp: number): string => {
  if (xp < 1000) {
    return String(xp);
  }
  // Round to one decimal without relying on toFixed's binary rounding.
  const tenths = Math.round(xp / 100) / 10;
  return Number.isInteger(tenths) ? `${tenths}k` : `${tenths}k`;
};

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

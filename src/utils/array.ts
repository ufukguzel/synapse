/**
 * Fisher-Yates shuffle. Returns a new array; the input is left alone.
 * `random` is injectable so tests can pin the ordering.
 */
export const shuffle = <T>(items: readonly T[], random: () => number = Math.random): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

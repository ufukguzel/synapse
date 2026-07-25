/** Loose text comparison used to grade free-text answers. */
export const normalizeAnswer = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ');

/**
 * Damerau-Levenshtein distance: counts insertions, deletions, substitutions and
 * adjacent transpositions. Transpositions matter here because "recieve" is one
 * slip of the fingers away from "receive", not two.
 */
export const editDistance = (a: string, b: string): number => {
  if (a === b) {
    return 0;
  }
  if (!a.length) {
    return b.length;
  }
  if (!b.length) {
    return a.length;
  }

  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({length: rows}, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    d[i]![0] = i;
  }
  for (let j = 0; j < cols; j++) {
    d[0]![j] = j;
  }

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        d[i - 1]![j]! + 1, // deletion
        d[i]![j - 1]! + 1, // insertion
        d[i - 1]![j - 1]! + cost, // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, d[i - 2]![j - 2]! + 1); // transposition
      }
      d[i]![j] = value;
    }
  }

  return d[a.length]![b.length]!;
};

/** @deprecated kept for backwards compatibility - use editDistance. */
export const levenshtein = editDistance;

export const isAnswerCorrect = (userAnswer: string, accepted: string[], tolerance = 1): boolean => {
  const normalized = normalizeAnswer(userAnswer);
  return accepted.some(candidate => {
    const target = normalizeAnswer(candidate);
    if (normalized === target) {
      return true;
    }
    // Don't let the tolerance swallow very short words ("cat" vs "cut").
    const allowed = target.length <= 4 ? 0 : tolerance;
    return editDistance(normalized, target) <= allowed;
  });
};

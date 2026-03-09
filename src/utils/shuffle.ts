/**
 * Fisher-Yates shuffle — returns a NEW shuffled array,
 * preserving the original order of the input.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffle an array and keep track of where each original
 * index ended up (so we can still identify the correct answer).
 * Returns { shuffled, originalIndices }
 * originalIndices[newIndex] = oldIndex
 */
export function shuffleWithIndex<T>(array: T[]): {
  shuffled: T[];
  originalIndices: number[];
} {
  const indexed = array.map((item, i) => ({ item, originalIndex: i }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    shuffled: indexed.map((x) => x.item),
    originalIndices: indexed.map((x) => x.originalIndex),
  };
}

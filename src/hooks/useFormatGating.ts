/**
 * Hook for determining format availability based on the learner's
 * learning plan and objective progress.
 *
 * Supports flexible format ordering: default A→B→C or artefact-first A→C→B.
 * The format order is read from the learning plan (when connected to Supabase).
 * For now, defaults are used.
 */

type FormatType = 'A' | 'B' | 'C';

interface FormatGatingResult {
  /** Ordered sequence of formats for this objective */
  formatOrder: FormatType[];
  /** Whether a given format is unlocked (prerequisites complete) */
  isFormatUnlocked: (format: FormatType) => boolean;
  /** The next format the learner should complete, or null if all done */
  nextFormat: FormatType | null;
}

const DEFAULT_ORDER: FormatType[] = ['A', 'B', 'C'];

/**
 * Determines format availability for a given objective.
 *
 * @param objectiveId - The objective to check
 * @param completedFormats - Set of format letters the learner has completed for this objective
 * @param formatOrder - Custom format order from learning plan (defaults to A→B→C)
 */
export function useFormatGating(
  _objectiveId: number,
  completedFormats: Set<FormatType> = new Set(),
  formatOrder: FormatType[] = DEFAULT_ORDER,
): FormatGatingResult {
  const isFormatUnlocked = (format: FormatType): boolean => {
    const index = formatOrder.indexOf(format);
    if (index === -1) return false;

    // First format in the sequence is always unlocked
    if (index === 0) return true;

    // Each subsequent format requires the previous one to be completed
    const previousFormat = formatOrder[index - 1];
    return completedFormats.has(previousFormat);
  };

  const nextFormat = formatOrder.find((f) => !completedFormats.has(f)) ?? null;

  return {
    formatOrder,
    isFormatUnlocked,
    nextFormat,
  };
}

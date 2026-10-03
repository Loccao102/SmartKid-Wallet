export interface QuizProgress {
  index: number
  answer: string
  mistakes: number
  feedback: 'hint' | 'correct' | null
}

export function restoreQuizProgress(value: unknown, questionCount: number): QuizProgress {
  const fresh: QuizProgress = { index: 0, answer: '', mistakes: 0, feedback: null }
  if (!value || typeof value !== 'object') return fresh
  const state = value as Partial<QuizProgress>
  if (!Number.isInteger(state.index) || state.index! < 0 || state.index! >= questionCount ||
    !Number.isInteger(state.mistakes) || state.mistakes! < 0 ||
    typeof state.answer !== 'string' || state.answer.length > 30 ||
    ![null, 'hint', 'correct'].includes(state.feedback ?? null)) return fresh
  return { index: state.index!, answer: state.answer, mistakes: state.mistakes!, feedback: state.feedback ?? null }
}

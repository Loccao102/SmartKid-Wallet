import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { scoreProceduralQuiz } from '../../core/worldChapter/runtime'
import { restoreQuizProgress, type QuizProgress } from '../../core/worldChapter/quizProgress'
import type { WorldChapterQuestion } from '../../core/worldChapter/types'

export type WorldChapterQuizTheme = 'bank' | 'restaurant' | 'market'

/** Read-only presentation hook; the shared runner still owns all quiz behavior. */
export interface WorldChapterQuizSceneState {
  questionIndex: number
  questionId: string
  completedCount: number
  totalQuestions: number
  isCorrect: boolean
  finished: boolean
  /** Only a correct answer in this mount celebrates; restored progress stays settled. */
  celebrate: boolean
}

export interface WorldChapterQuizCopy {
  exitLabel: string
  counterLabel: string
  inputLabel: string
  inputPlaceholder: string
  idleTip: string
  correctFeedback: string
  completeEyebrow: string
  completeDescription: string
  backLabel: string
}

export function WorldChapterStars({
  value,
  className = '',
}: {
  value: number
  className?: string
}) {
  return (
    <span
      className={'chapter-stars ' + className}
      aria-label={value + ' trên 5 sao'}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={17}
          fill={index < value ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

export function WorldChapterQuiz({
  theme,
  lessonTitle,
  skillLabel,
  questions,
  icon: Icon,
  copy,
  onExit,
  onComplete,
  checkpoint,
  onCheckpoint,
  renderScene,
}: {
  theme: WorldChapterQuizTheme
  lessonTitle: string
  skillLabel: string
  questions: WorldChapterQuestion[]
  icon: LucideIcon
  copy: WorldChapterQuizCopy
  onExit: () => void
  onComplete: (stars: number) => void
  checkpoint?: unknown
  onCheckpoint?: (state: QuizProgress) => void
  renderScene?: (state: WorldChapterQuizSceneState) => ReactNode
}) {
  const [progress, setProgress] = useState(() => restoreQuizProgress(checkpoint, questions.length))
  const { index, answer, mistakes, feedback } = progress
  const update = (patch: Partial<QuizProgress>) => {
    const next = { ...progress, ...patch }
    setProgress(next)
    onCheckpoint?.(next)
  }
  const [finished, setFinished] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const finishOnce = useRef(false)
  const answerRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const question = questions[index]
  useEffect(() => {
    if (finished) resultRef.current?.focus()
    else answerRef.current?.focus()
  }, [index, finished])

  if (!question) {
    throw new Error('WorldChapterQuiz requires at least one question')
  }

  const submit = () => {
    if (finished || feedback === 'correct' || !answer.trim()) return
    const parsed = Number(answer.replace(/[.\s,]/g, ''))
    if (!Number.isFinite(parsed)) return

    if (parsed !== question.answer) {
      setCelebrate(false)
      update({ mistakes: mistakes + 1, feedback: 'hint', answer: '' })
      return
    }

    setCelebrate(true)
    update({ feedback: 'correct' })
  }

  const stars = scoreProceduralQuiz(mistakes)
  const sceneState: WorldChapterQuizSceneState = {
    questionIndex: index,
    questionId: question.id,
    completedCount: finished ? questions.length : Math.min(questions.length, index + (feedback === 'correct' ? 1 : 0)),
    totalQuestions: questions.length,
    isCorrect: feedback === 'correct',
    finished,
    celebrate: celebrate && !finished,
  }
  const quizClassName = 'chapter-quiz chapter-theme-' + theme + (renderScene ? ' chapter-quiz-has-scene' : '')
  const renderPlay = (content: ReactNode) => renderScene
    ? <div className="chapter-quiz-play">{renderScene(sceneState)}{content}</div>
    : content

  if (finished) {
    return (
      <section className={quizClassName}>
        {renderPlay(<div className="chapter-quiz-finish">
          <span className="chapter-quiz-finish-icon">
            <Check size={34} aria-hidden="true" />
          </span>
          <p className="eyebrow">{copy.completeEyebrow}</p>
          <h2 ref={resultRef} tabIndex={-1}>{lessonTitle}</h2>
          <WorldChapterStars value={stars} />
          <p>{copy.completeDescription}</p>
          <button type="button" className="adventure-button" onClick={onExit}>
            {copy.backLabel} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>)}
      </section>
    )
  }

  return (
    <section className={quizClassName}>
      <header className="chapter-quiz-heading">
        <button type="button" className="quiet-button" onClick={onExit}>
          <ArrowLeft size={18} aria-hidden="true" />
          {copy.exitLabel}
        </button>
        <span>
          {copy.counterLabel} {index + 1}/{questions.length}
        </span>
      </header>

      <div className="chapter-quiz-progress" aria-hidden="true">
        {questions.map((item, itemIndex) => (
          <i
            key={item.id}
            className={
              itemIndex < index
                ? 'done'
                : itemIndex === index
                  ? 'current'
                  : ''
            }
          />
        ))}
      </div>

      {renderPlay(<div className="chapter-quiz-card">
        <span className="chapter-quiz-icon">
          <Icon size={28} aria-hidden="true" />
        </span>
        <p className="eyebrow">{skillLabel}</p>
        <h2>{question.prompt}</h2>

        <label htmlFor="chapter-quiz-answer">{copy.inputLabel}</label>
        <div className="chapter-quiz-answer">
          <input
            ref={answerRef}
            id="chapter-quiz-answer"
            inputMode="numeric"
            value={answer}
            onChange={(event) => update({ answer: event.target.value.slice(0, 30) })}
            readOnly={feedback === 'correct'}
            placeholder={copy.inputPlaceholder}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
          />
          <span>{question.unit}</span>
        </div>

        {feedback ? (
          <div className="chapter-quiz-hint" role="status">
            <Sparkles size={17} aria-hidden="true" />
            <span>{feedback === 'correct' ? copy.correctFeedback : question.hint}</span>
          </div>
        ) : (
          <p className="chapter-quiz-tip">{copy.idleTip}</p>
        )}

        <button
          type="button"
          className="adventure-button chapter-quiz-submit"
          disabled={!answer.trim()}
          onClick={() => {
            if (feedback !== 'correct') { submit(); return }
            if (index < questions.length - 1) {
              setCelebrate(false)
              update({ index: index + 1, answer: '', feedback: null })
            } else {
              if (finishOnce.current) return
              finishOnce.current = true
              setCelebrate(false)
              setFinished(true)
              onComplete(stars)
            }
          }}
        >
          {feedback === 'correct' ? index < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả' : 'Kiểm tra'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>)}
    </section>
  )
}

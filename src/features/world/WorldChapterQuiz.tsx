import { useState, type ComponentType } from 'react'
import { ArrowLeft, ArrowRight, Check, Sparkles, Star } from 'lucide-react'
import { scoreProceduralQuiz } from '../../core/worldChapter/runtime'
import type { WorldChapterQuestion } from '../../core/worldChapter/types'

export type WorldChapterQuizTheme = 'bank' | 'restaurant' | 'market'

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
}: {
  theme: WorldChapterQuizTheme
  lessonTitle: string
  skillLabel: string
  questions: WorldChapterQuestion[]
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
  copy: WorldChapterQuizCopy
  onExit: () => void
  onComplete: (stars: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [mistakes, setMistakes] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const question = questions[index]

  if (!question) {
    throw new Error('WorldChapterQuiz requires at least one question')
  }

  const submit = () => {
    const parsed = Number(answer.replace(/[.\s,]/g, ''))
    if (!Number.isFinite(parsed)) return

    if (parsed !== question.answer) {
      setMistakes((current) => current + 1)
      setFeedback(question.hint)
      setAnswer('')
      return
    }

    setFeedback(copy.correctFeedback)

    if (index < questions.length - 1) {
      window.setTimeout(() => {
        setIndex((current) => current + 1)
        setAnswer('')
        setFeedback(null)
      }, 450)
      return
    }

    const stars = scoreProceduralQuiz(mistakes)
    setFinished(true)
    onComplete(stars)
  }

  const stars = scoreProceduralQuiz(mistakes)

  if (finished) {
    return (
      <section className={'chapter-quiz chapter-theme-' + theme}>
        <div className="chapter-quiz-finish">
          <span className="chapter-quiz-finish-icon">
            <Check size={34} aria-hidden="true" />
          </span>
          <p className="eyebrow">{copy.completeEyebrow}</p>
          <h2>{lessonTitle}</h2>
          <WorldChapterStars value={stars} />
          <p>{copy.completeDescription}</p>
          <button type="button" className="adventure-button" onClick={onExit}>
            {copy.backLabel} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={'chapter-quiz chapter-theme-' + theme}>
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

      <div className="chapter-quiz-card">
        <span className="chapter-quiz-icon">
          <Icon size={28} aria-hidden="true" />
        </span>
        <p className="eyebrow">{skillLabel}</p>
        <h2>{question.prompt}</h2>

        <label htmlFor="chapter-quiz-answer">{copy.inputLabel}</label>
        <div className="chapter-quiz-answer">
          <input
            id="chapter-quiz-answer"
            inputMode="numeric"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
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
            <span>{feedback}</span>
          </div>
        ) : (
          <p className="chapter-quiz-tip">{copy.idleTip}</p>
        )}

        <button
          type="button"
          className="adventure-button chapter-quiz-submit"
          disabled={!answer.trim()}
          onClick={submit}
        >
          Kiểm tra <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

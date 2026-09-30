import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CircleDollarSign,
  Landmark,
  LockKeyhole,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import {
  createTinyBankMission,
  createTinyBankQuiz,
  scoreTinyBankMission,
  tinyBankLessons,
  type TinyBankLessonId,
  type TinyBankMissionRun,
} from '../../data/tinyBank'
import { useProgressionStore } from '../../store/progression'
import { useTinyBankProgressStore } from '../../store/tinyBankProgress'

const money = new Intl.NumberFormat('vi-VN')

const lessonIcons = {
  'saving-goal': Target,
  'balance-counter': Banknote,
  'growth-bonus': TrendingUp,
  'four-week-mission': ShieldCheck,
} satisfies Record<TinyBankLessonId, typeof Target>

function Stars({ value }: { value: number }) {
  return (
    <span className="bank-stars" aria-label={value + ' trên 5 sao'}>
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

function QuizLesson({
  lessonId,
  seed,
  onExit,
  onComplete,
}: {
  lessonId: Exclude<TinyBankLessonId, 'four-week-mission'>
  seed: number
  onExit: () => void
  onComplete: (stars: number) => void
}) {
  const questions = useMemo(
    () => createTinyBankQuiz(lessonId, seed),
    [lessonId, seed],
  )
  const lesson = tinyBankLessons.find((item) => item.id === lessonId)!
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [mistakes, setMistakes] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const question = questions[index]

  const submit = () => {
    const parsed = Number(answer.replace(/[.s,]/g, ''))
    if (!Number.isFinite(parsed)) return

    if (parsed !== question.answer) {
      setMistakes((current) => current + 1)
      setFeedback(question.hint)
      setAnswer('')
      return
    }

    setFeedback('Chính xác. Em đã theo dõi dòng tiền rất tốt.')
    if (index < questions.length - 1) {
      window.setTimeout(() => {
        setIndex((current) => current + 1)
        setAnswer('')
        setFeedback(null)
      }, 450)
      return
    }

    const stars =
      mistakes === 0 ? 5 : mistakes <= 2 ? 4 : mistakes <= 4 ? 3 : 2
    setFinished(true)
    onComplete(stars)
  }

  if (finished) {
    const stars =
      mistakes === 0 ? 5 : mistakes <= 2 ? 4 : mistakes <= 4 ? 3 : 2
    return (
      <section className="bank-play-panel bank-complete-panel">
        <span className="bank-complete-icon">
          <Check size={34} aria-hidden="true" />
        </span>
        <p className="eyebrow">HOÀN THÀNH BÀI LUYỆN</p>
        <h2>{lesson.title}</h2>
        <Stars value={stars} />
        <p>
          Em đã xử lý đủ 3 tình huống. Lần sau số tiền sẽ đổi để em luyện cách
          suy nghĩ thay vì nhớ đáp án.
        </p>
        <button type="button" className="adventure-button" onClick={onExit}>
          Về sảnh ngân hàng <ArrowRight size={18} />
        </button>
      </section>
    )
  }

  return (
    <section className="bank-play-panel">
      <header className="bank-play-heading">
        <button type="button" className="quiet-button" onClick={onExit}>
          <ArrowLeft size={18} /> Thoát bài
        </button>
        <span>
          Câu {index + 1}/{questions.length}
        </span>
      </header>

      <div className="bank-question-progress" aria-hidden="true">
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

      <div className="bank-question-card">
        <span className="bank-question-icon">
          <CircleDollarSign size={28} aria-hidden="true" />
        </span>
        <p className="eyebrow">{lesson.skillLabel}</p>
        <h2>{question.prompt}</h2>
        <label htmlFor="tiny-bank-answer">Câu trả lời của em</label>
        <div className="bank-answer">
          <input
            id="tiny-bank-answer"
            inputMode="numeric"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Nhập số tiền"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
          />
          <span>{question.unit}</span>
        </div>
        {feedback ? (
          <div className="bank-hint" role="status">
            <Sparkles size={17} aria-hidden="true" />
            <span>{feedback}</span>
          </div>
        ) : (
          <p className="bank-question-tip">
            Em có thể nháp từng bước trước khi nhập kết quả.
          </p>
        )}
        <button
          type="button"
          className="adventure-button bank-submit"
          disabled={!answer.trim()}
          onClick={submit}
        >
          Kiểm tra <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

function MissionLesson({
  run,
  onExit,
  onFinish,
}: {
  run: TinyBankMissionRun
  onExit: () => void
  onFinish: (stars: number) => void
}) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [savings, setSavings] = useState(run.startingSavings)
  const [reserve, setReserve] = useState(run.startingReserve)
  const [joy, setJoy] = useState(0)
  const [consequence, setConsequence] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const round = run.rounds[roundIndex]

  const choose = (choice: (typeof round.choices)[number]) => {
    setSavings((current) => current + choice.savingsDelta)
    setReserve((current) => Math.max(0, current + choice.reserveDelta))
    setJoy((current) => current + choice.joyDelta)
    setConsequence(choice.consequence)
  }

  const next = () => {
    if (roundIndex < run.rounds.length - 1) {
      setRoundIndex((current) => current + 1)
      setConsequence(null)
      return
    }
    const stars = scoreTinyBankMission(run, savings, reserve, joy)
    setFinished(true)
    onFinish(stars)
  }

  if (finished) {
    const stars = scoreTinyBankMission(run, savings, reserve, joy)
    const passed = stars >= 3
    return (
      <section className="bank-play-panel bank-mission-result">
        <span className={passed ? 'bank-complete-icon' : 'bank-retry-icon'}>
          {passed ? <Check size={34} /> : <RotateCcw size={34} />}
        </span>
        <p className="eyebrow">KẾT QUẢ 4 TUẦN</p>
        <h2>{passed ? 'Em đã hoàn thành kế hoạch!' : 'Thử một kế hoạch khác nhé'}</h2>
        <Stars value={stars} />
        <div className="bank-result-grid">
          <div>
            <span>Tiền mục tiêu</span>
            <strong>{money.format(savings)}đ</strong>
            <small>Mục tiêu {money.format(run.goal)}đ</small>
          </div>
          <div>
            <span>Quỹ dự phòng</span>
            <strong>{money.format(reserve)}đ</strong>
            <small>{reserve >= 15_000 ? 'Vẫn còn vùng an toàn' : 'Quỹ đã khá mỏng'}</small>
          </div>
          <div>
            <span>Cân bằng</span>
            <strong>{joy} điểm</strong>
            <small>Niềm vui nhỏ cũng là một phần của kế hoạch.</small>
          </div>
        </div>
        <p className="bank-result-note">
          Không phải lúc nào gửi nhiều nhất cũng là lựa chọn duy nhất. Kế hoạch
          tốt cần nhìn cả mục tiêu, việc cần làm và khoản dự phòng.
        </p>
        <button type="button" className="adventure-button" onClick={onExit}>
          Về sảnh ngân hàng <ArrowRight size={18} />
        </button>
      </section>
    )
  }

  return (
    <section className="bank-play-panel bank-mission-panel">
      <header className="bank-play-heading">
        <button type="button" className="quiet-button" onClick={onExit}>
          <ArrowLeft size={18} /> Thoát mission
        </button>
        <span>Tuần {roundIndex + 1}/4</span>
      </header>

      <div className="bank-mission-stats">
        <div>
          <Target size={18} />
          <span>Mục tiêu</span>
          <strong>{money.format(run.goal)}đ</strong>
        </div>
        <div>
          <PiggyBank size={18} />
          <span>Đã để dành</span>
          <strong>{money.format(savings)}đ</strong>
        </div>
        <div>
          <ShieldCheck size={18} />
          <span>Dự phòng</span>
          <strong>{money.format(reserve)}đ</strong>
        </div>
      </div>

      <div className="bank-story-card">
        <p className="eyebrow">{round.title}</p>
        <h2>{round.story}</h2>
        <p>
          Chọn cách em muốn xử lý. Game sẽ không báo đúng/sai ngay — em sẽ thấy
          kế hoạch của mình thay đổi thế nào.
        </p>
      </div>

      {!consequence ? (
        <div className="bank-choice-grid">
          {round.choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => choose(choice)}>
              <span className="bank-choice-dot" aria-hidden="true" />
              <strong>{choice.label}</strong>
              <small>{choice.description}</small>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <div className="bank-consequence" role="status">
          <Sparkles size={22} aria-hidden="true" />
          <div>
            <strong>Điều xảy ra sau lựa chọn của em</strong>
            <p>{consequence}</p>
          </div>
          <button type="button" className="adventure-button" onClick={next}>
            {roundIndex < run.rounds.length - 1 ? 'Sang tuần tiếp' : 'Xem kết quả'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  )
}

export function TinyBankScreen({ onBack }: { onBack: () => void }) {
  const completedLessonIds = useTinyBankProgressStore(
    (state) => state.completedLessonIds,
  )
  const bestStarsByLessonId = useTinyBankProgressStore(
    (state) => state.bestStarsByLessonId,
  )
  const nextRun = useTinyBankProgressStore((state) => state.nextRun)
  const completeLesson = useTinyBankProgressStore((state) => state.completeLesson)
  const awardXpOnce = useProgressionStore((state) => state.awardXpOnce)
  const claimChallengeReward = useProgressionStore(
    (state) => state.claimChallengeReward,
  )
  const recordActivityResult = useProgressionStore(
    (state) => state.recordActivityResult,
  )
  const completeWorldChapter = useProgressionStore(
    (state) => state.completeWorldChapter,
  )
  const completedWorldChapterIds = useProgressionStore(
    (state) => state.completedWorldChapterIds,
  )

  const [activeLessonId, setActiveLessonId] =
    useState<TinyBankLessonId | null>(null)
  const [runSeed, setRunSeed] = useState(1)

  const chapterCompleted = completedWorldChapterIds.includes('tiny-bank')
  const coreCompleted = tinyBankLessons
    .slice(0, 3)
    .every((lesson) => completedLessonIds.includes(lesson.id))

  const startLesson = (lessonId: TinyBankLessonId) => {
    const run = nextRun(lessonId)
    const lessonIndex = tinyBankLessons.findIndex((item) => item.id === lessonId)
    setRunSeed(20260930 + run * 7919 + lessonIndex * 104729)
    setActiveLessonId(lessonId)
  }

  const finishLesson = (lessonId: TinyBankLessonId, stars: number) => {
    const passed = lessonId !== 'four-week-mission' || stars >= 3
    const lesson = tinyBankLessons.find((item) => item.id === lessonId)!

    recordActivityResult('tiny-bank:' + lessonId + ':v1', stars, stars * 20)

    if (!passed) return

    completeLesson(lessonId, stars)
    awardXpOnce('tiny-bank:' + lessonId, lesson.xpReward)

    if (lessonId === 'four-week-mission') {
      completeWorldChapter('tiny-bank')
      awardXpOnce('tiny-bank:chapter:v1', 80)
      claimChallengeReward('tiny-bank:chapter:v1', 80)
    }
  }

  if (activeLessonId && activeLessonId !== 'four-week-mission') {
    return (
      <QuizLesson
        key={activeLessonId + ':' + runSeed}
        lessonId={activeLessonId}
        seed={runSeed}
        onExit={() => setActiveLessonId(null)}
        onComplete={(stars) => finishLesson(activeLessonId, stars)}
      />
    )
  }

  if (activeLessonId === 'four-week-mission') {
    return (
      <MissionLesson
        key={'mission:' + runSeed}
        run={createTinyBankMission(runSeed)}
        onExit={() => setActiveLessonId(null)}
        onFinish={(stars) => finishLesson('four-week-mission', stars)}
      />
    )
  }

  return (
    <section className="tiny-bank-screen">
      <div className="bank-toolbar">
        <button type="button" className="quiet-button" onClick={onBack}>
          <ArrowLeft size={18} /> Bản đồ
        </button>
        <span className="bank-chapter-progress">
          {completedLessonIds.length}/4 chặng
        </span>
      </div>

      <header className="bank-hero">
        <div>
          <p className="eyebrow">
            <Landmark size={16} /> NGÂN HÀNG TÍ HON
          </p>
          <h1>Biến một mục tiêu lớn thành những bước nhỏ.</h1>
          <p>
            Không phải học cách “giàu nhanh”. Em sẽ luyện cách theo dõi tiền,
            chia mục tiêu, hiểu phần trăm và giữ một khoản dự phòng.
          </p>
          <div className="bank-hero-pills">
            <span><PiggyBank size={15} /> Tiết kiệm</span>
            <span><CircleDollarSign size={15} /> Dòng tiền</span>
            <span><ShieldCheck size={15} /> Dự phòng</span>
          </div>
        </div>
        <div className="bank-hero-art">
          <img src={gameAssets.production.maps['tiny-bank']} alt="" />
          <span>{chapterCompleted ? 'Chương đã hoàn thành' : '4 chặng khám phá'}</span>
        </div>
      </header>

      {chapterCompleted ? (
        <div className="bank-chapter-banner">
          <Sparkles size={24} />
          <div>
            <strong>Em đã hoàn thành Ngân hàng tí hon!</strong>
            <span>Nhà hàng vui vẻ sẽ mở khi em đạt đủ cấp độ.</span>
          </div>
        </div>
      ) : null}

      <div className="bank-room-grid">
        {tinyBankLessons.map((lesson, index) => {
          const Icon = lessonIcons[lesson.id]
          const previous = tinyBankLessons[index - 1]
          const unlocked =
            index === 0 ||
            (lesson.id === 'four-week-mission'
              ? coreCompleted
              : Boolean(previous && completedLessonIds.includes(previous.id)))
          const completed = completedLessonIds.includes(lesson.id)
          const stars = bestStarsByLessonId[lesson.id] ?? 0

          return (
            <article
              key={lesson.id}
              className={
                'bank-room bank-room-' +
                (index + 1) +
                ' ' +
                (unlocked ? 'is-open' : 'is-locked')
              }
            >
              <span className="bank-room-number">
                {lesson.id === 'four-week-mission' ? 'MISSION' : '0' + (index + 1)}
              </span>
              <span className="bank-room-icon">
                {unlocked ? <Icon size={32} /> : <LockKeyhole size={28} />}
              </span>
              <div>
                <p>{lesson.subtitle}</p>
                <h2>{lesson.title}</h2>
                <span>{lesson.skillLabel}</span>
              </div>
              {stars ? <Stars value={stars} /> : null}
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => startLesson(lesson.id)}
              >
                {completed
                  ? 'Chơi lại với số mới'
                  : unlocked
                    ? lesson.id === 'four-week-mission'
                      ? 'Bắt đầu mission'
                      : 'Vào quầy'
                    : 'Hoàn thành chặng trước'}
                {unlocked ? <ArrowRight size={18} /> : null}
              </button>
            </article>
          )
        })}
      </div>

      <aside className="bank-learning-note">
        <ShieldCheck size={22} />
        <div>
          <strong>Đây là mô phỏng học tập</strong>
          <p>
            Tỉ lệ phần trăm trong bài chỉ dùng để luyện Toán và hiểu khái niệm;
            không phải lãi suất hay lời khuyên tài chính ngoài đời.
          </p>
        </div>
      </aside>
    </section>
  )
}

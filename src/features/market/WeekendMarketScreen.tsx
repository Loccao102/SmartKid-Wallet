import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Check,
  Coins,
  HandCoins,
  PackageCheck,
  RotateCcw,
  Scale,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import {
  createMarketDay,
  createWeekendMarketQuiz,
  scoreMarketDay,
  weekendMarketLessons,
  type MarketDayRun,
  type WeekendMarketLessonId,
} from '../../data/weekendMarket'
import { useProgressionStore } from '../../store/progression'
import { useWeekendMarketProgressStore } from '../../store/weekendMarketProgress'

const money = new Intl.NumberFormat('vi-VN')

const lessonIcons = {
  'unit-price': Scale,
  'profit-loss': Coins,
  'fair-bargain': HandCoins,
  'market-day': Store,
} satisfies Record<WeekendMarketLessonId, typeof Store>

function Stars({ value }: { value: number }) {
  return (
    <span className="market-stars" aria-label={value + ' trên 5 sao'}>
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

function MarketQuiz({
  lessonId,
  seed,
  onExit,
  onComplete,
}: {
  lessonId: Exclude<WeekendMarketLessonId, 'market-day'>
  seed: number
  onExit: () => void
  onComplete: (stars: number) => void
}) {
  const questions = useMemo(
    () => createWeekendMarketQuiz(lessonId, seed),
    [lessonId, seed],
  )
  const lesson = weekendMarketLessons.find((item) => item.id === lessonId)!
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [mistakes, setMistakes] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const question = questions[index]

  const submit = () => {
    const parsed = Number(answer.replace(/[.\s,]/g, ''))
    if (!Number.isFinite(parsed)) return

    if (parsed !== question.answer) {
      setMistakes((current) => current + 1)
      setFeedback(question.hint)
      setAnswer('')
      return
    }

    if (index < questions.length - 1) {
      setFeedback('Chuẩn rồi! Sang lượt tính tiếp theo nhé.')
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
      <section className="market-play market-finish">
        <span className="market-finish-icon">
          <Check size={34} />
        </span>
        <p className="eyebrow">HOÀN THÀNH BÀI LUYỆN</p>
        <h2>{lesson.title}</h2>
        <Stars value={stars} />
        <p>
          Lượt sau số liệu sẽ đổi, nên em phải hiểu cách tính chứ không thể nhớ
          đáp án cũ.
        </p>
        <button type="button" className="adventure-button" onClick={onExit}>
          Về khu chợ <ArrowRight size={18} />
        </button>
      </section>
    )
  }

  return (
    <section className="market-play">
      <header className="market-play-heading">
        <button type="button" className="quiet-button" onClick={onExit}>
          <ArrowLeft size={18} /> Thoát bài
        </button>
        <span>
          Bài {index + 1}/{questions.length}
        </span>
      </header>

      <div className="market-question-card">
        <span className="market-question-icon">
          <ShoppingBasket size={28} />
        </span>
        <p className="eyebrow">{lesson.skillLabel}</p>
        <h2>{question.prompt}</h2>

        <label htmlFor="market-answer">Kết quả của em</label>
        <div className="market-answer">
          <input
            id="market-answer"
            inputMode="numeric"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Nhập kết quả"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
          />
          <span>{question.unit}</span>
        </div>

        {feedback ? (
          <div className="market-hint" role="status">
            <Sparkles size={17} />
            <span>{feedback}</span>
          </div>
        ) : (
          <p className="market-tip">
            So sánh theo cùng một đơn vị trước khi quyết định.
          </p>
        )}

        <button
          type="button"
          className="adventure-button market-submit"
          disabled={!answer.trim()}
          onClick={submit}
        >
          Kiểm tra <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

function MarketDay({
  run,
  onExit,
  onFinish,
}: {
  run: MarketDayRun
  onExit: () => void
  onFinish: (stars: number) => void
}) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [cash, setCash] = useState(0)
  const [trust, setTrust] = useState(0)
  const [stock, setStock] = useState(run.startingStock)
  const [waste, setWaste] = useState(0)
  const [consequence, setConsequence] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const round = run.rounds[roundIndex]

  const choose = (choice: (typeof round.choices)[number]) => {
    setCash((current) => current + choice.cashDelta)
    setTrust((current) => current + choice.trustDelta)
    setStock((current) => Math.max(0, current + choice.stockDelta))
    setWaste((current) => current + choice.wasteDelta)
    setConsequence(choice.consequence)
  }

  const next = () => {
    if (roundIndex < run.rounds.length - 1) {
      setRoundIndex((current) => current + 1)
      setConsequence(null)
      return
    }

    const stars = scoreMarketDay(run, cash, trust, stock, waste)
    setFinished(true)
    onFinish(stars)
  }

  if (finished) {
    const stars = scoreMarketDay(run, cash, trust, stock, waste)
    const passed = stars >= 3

    return (
      <section className="market-play market-finish">
        <span className={passed ? 'market-finish-icon' : 'market-retry-icon'}>
          {passed ? <Check size={34} /> : <RotateCcw size={34} />}
        </span>
        <p className="eyebrow">KẾT THÚC BUỔI CHỢ</p>
        <h2>{passed ? 'Quầy hàng kết thúc một ngày đẹp!' : 'Thử điều hành quầy theo cách khác'}</h2>
        <Stars value={stars} />

        <div className="market-result-grid">
          <div>
            <Coins size={19} />
            <span>Tiền bán hàng</span>
            <strong>{money.format(cash)}đ</strong>
            <small>Mục tiêu {money.format(run.targetCash)}đ</small>
          </div>
          <div>
            <UsersRound size={19} />
            <span>Uy tín</span>
            <strong>{trust} điểm</strong>
            <small>Khách có muốn quay lại hay không.</small>
          </div>
          <div>
            <PackageCheck size={19} />
            <span>Hàng còn</span>
            <strong>{stock} món</strong>
            <small>Tồn kho càng ít càng dễ kết ngày.</small>
          </div>
          <div>
            <Trash2 size={19} />
            <span>Lãng phí</span>
            <strong>{waste} điểm</strong>
            <small>Càng thấp càng tốt.</small>
          </div>
        </div>

        <p className="market-result-note">
          Bán được nhiều chưa chắc là đủ. Một quầy tốt còn cần giá rõ ràng,
          khách tin tưởng và ít hàng bị bỏ đi.
        </p>

        <button type="button" className="adventure-button" onClick={onExit}>
          Về khu chợ <ArrowRight size={18} />
        </button>
      </section>
    )
  }

  return (
    <section className="market-play market-day">
      <header className="market-play-heading">
        <button type="button" className="quiet-button" onClick={onExit}>
          <ArrowLeft size={18} /> Thoát buổi chợ
        </button>
        <span>
          Tình huống {roundIndex + 1}/{run.rounds.length}
        </span>
      </header>

      <div className="market-live-metrics">
        <div><Coins size={17} /><span>Tiền bán</span><strong>{money.format(cash)}đ</strong></div>
        <div><UsersRound size={17} /><span>Uy tín</span><strong>{trust}</strong></div>
        <div><PackageCheck size={17} /><span>Hàng còn</span><strong>{stock}</strong></div>
        <div><Trash2 size={17} /><span>Lãng phí</span><strong>{waste}</strong></div>
      </div>

      <div className="market-story">
        <span className="market-story-icon"><Store size={30} /></span>
        <div>
          <p className="eyebrow">{round.title}</p>
          <h2>{round.story}</h2>
          <p>
            Em sẽ chỉ thấy hậu quả sau khi chọn, không có nút nào được đánh dấu
            sẵn là “đáp án đúng”.
          </p>
        </div>
      </div>

      {!consequence ? (
        <div className="market-choice-grid">
          {round.choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => choose(choice)}>
              <span className="market-choice-mark" />
              <strong>{choice.label}</strong>
              <small>{choice.description}</small>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      ) : (
        <div className="market-consequence" role="status">
          <Sparkles size={22} />
          <div>
            <strong>Điều xảy ra sau đó</strong>
            <p>{consequence}</p>
          </div>
          <button type="button" className="adventure-button" onClick={next}>
            {roundIndex < run.rounds.length - 1 ? 'Tiếp tục bán hàng' : 'Đóng quầy'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  )
}

export function WeekendMarketScreen({ onBack }: { onBack: () => void }) {
  const completedLessonIds = useWeekendMarketProgressStore(
    (state) => state.completedLessonIds,
  )
  const bestStarsByLessonId = useWeekendMarketProgressStore(
    (state) => state.bestStarsByLessonId,
  )
  const nextRun = useWeekendMarketProgressStore((state) => state.nextRun)
  const completeLesson = useWeekendMarketProgressStore(
    (state) => state.completeLesson,
  )

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
    useState<WeekendMarketLessonId | null>(null)
  const [runSeed, setRunSeed] = useState(1)

  const chapterCompleted =
    completedWorldChapterIds.includes('weekend-market')
  const coreCompleted = weekendMarketLessons
    .slice(0, 3)
    .every((lesson) => completedLessonIds.includes(lesson.id))

  const startLesson = (lessonId: WeekendMarketLessonId) => {
    const run = nextRun(lessonId)
    const lessonIndex = weekendMarketLessons.findIndex(
      (item) => item.id === lessonId,
    )
    setRunSeed(20261002 + run * 8209 + lessonIndex * 32771)
    setActiveLessonId(lessonId)
  }

  const finishLesson = (lessonId: WeekendMarketLessonId, stars: number) => {
    const passed = lessonId !== 'market-day' || stars >= 3
    const lesson = weekendMarketLessons.find((item) => item.id === lessonId)!

    recordActivityResult(
      'weekend-market:' + lessonId + ':v1',
      stars,
      stars * 20,
    )

    if (!passed) return

    completeLesson(lessonId, stars)
    awardXpOnce('weekend-market:' + lessonId, lesson.xpReward)

    if (lessonId === 'market-day') {
      completeWorldChapter('weekend-market')
      awardXpOnce('weekend-market:chapter:v1', 100)
      claimChallengeReward('weekend-market:chapter:v1', 100)
    }
  }

  if (activeLessonId && activeLessonId !== 'market-day') {
    return (
      <MarketQuiz
        key={activeLessonId + ':' + runSeed}
        lessonId={activeLessonId}
        seed={runSeed}
        onExit={() => setActiveLessonId(null)}
        onComplete={(stars) => finishLesson(activeLessonId, stars)}
      />
    )
  }

  if (activeLessonId === 'market-day') {
    return (
      <MarketDay
        key={'market:' + runSeed}
        run={createMarketDay(runSeed)}
        onExit={() => setActiveLessonId(null)}
        onFinish={(stars) => finishLesson('market-day', stars)}
      />
    )
  }

  return (
    <section className="weekend-market-screen">
      <div className="market-toolbar">
        <button type="button" className="quiet-button" onClick={onBack}>
          <ArrowLeft size={18} /> Bản đồ
        </button>
        <span>{completedLessonIds.length}/4 chặng</span>
      </div>

      <header className="market-hero">
        <div>
          <p className="eyebrow">
            <Store size={16} /> CHỢ CUỐI TUẦN
          </p>
          <h1>Mua bán thông minh bắt đầu từ hiểu giá trị.</h1>
          <p>
            So sánh đơn giá, tính lời lỗ và thử điều hành một quầy nhỏ mà vẫn
            giữ được sự công bằng với khách.
          </p>
          <div className="market-hero-tags">
            <span><Scale size={15} /> Đơn giá</span>
            <span><BadgePercent size={15} /> Mặc cả</span>
            <span><HandCoins size={15} /> Lời lỗ</span>
          </div>
        </div>
        <div className="market-hero-art">
          <img src={gameAssets.production.maps['weekend-market']} alt="" />
          <span>{chapterCompleted ? 'Đã hoàn thành chương' : 'Một buổi chợ đang chờ'}</span>
        </div>
      </header>

      {chapterCompleted ? (
        <div className="market-chapter-banner">
          <Sparkles size={24} />
          <div>
            <strong>Em đã hoàn thành toàn bộ hành trình hiện tại!</strong>
            <span>Các chương mới có thể nối tiếp từ đây mà không cần sửa lại progression cũ.</span>
          </div>
        </div>
      ) : null}

      <div className="market-room-grid">
        {weekendMarketLessons.map((lesson, index) => {
          const Icon = lessonIcons[lesson.id]
          const previous = weekendMarketLessons[index - 1]
          const unlocked =
            index === 0 ||
            (lesson.id === 'market-day'
              ? coreCompleted
              : Boolean(previous && completedLessonIds.includes(previous.id)))
          const completed = completedLessonIds.includes(lesson.id)
          const stars = bestStarsByLessonId[lesson.id] ?? 0

          return (
            <article
              key={lesson.id}
              className={
                'market-room market-room-' +
                (index + 1) +
                ' ' +
                (unlocked ? 'is-open' : 'is-locked')
              }
            >
              <span className="market-room-index">
                {lesson.id === 'market-day' ? 'MISSION' : '0' + (index + 1)}
              </span>
              <span className="market-room-icon"><Icon size={32} /></span>
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
                    ? lesson.id === 'market-day'
                      ? 'Mở quầy'
                      : 'Bắt đầu'
                    : 'Hoàn thành chặng trước'}
                {unlocked ? <ArrowRight size={18} /> : null}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

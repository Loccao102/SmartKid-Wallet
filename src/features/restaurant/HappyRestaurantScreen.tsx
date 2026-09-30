import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Check,
  Clock3,
  Coins,
  CookingPot,
  ReceiptText,
  RotateCcw,
  Scale,
  Sparkles,
  Star,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import {
  createRestaurantQuiz,
  createRestaurantRush,
  restaurantLessons,
  scoreRestaurantRush,
  type RestaurantLessonId,
  type RestaurantRushRun,
} from '../../data/happyRestaurant'
import { useProgressionStore } from '../../store/progression'
import { useRestaurantProgressStore } from '../../store/restaurantProgress'

const money = new Intl.NumberFormat('vi-VN')

const lessonIcons = {
  'share-table': UsersRound,
  'bill-counter': ReceiptText,
  'zero-waste': Scale,
  'dinner-rush': ChefHat,
} satisfies Record<RestaurantLessonId, typeof ChefHat>

function Stars({ value }: { value: number }) {
  return (
    <span className="restaurant-stars" aria-label={value + ' trên 5 sao'}>
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

function RestaurantQuiz({
  lessonId,
  seed,
  onExit,
  onComplete,
}: {
  lessonId: Exclude<RestaurantLessonId, 'dinner-rush'>
  seed: number
  onExit: () => void
  onComplete: (stars: number) => void
}) {
  const questions = useMemo(
    () => createRestaurantQuiz(lessonId, seed),
    [lessonId, seed],
  )
  const lesson = restaurantLessons.find((item) => item.id === lessonId)!
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
      setFeedback('Đúng rồi! Bếp chuyển sang tình huống tiếp theo.')
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
      <section className="restaurant-play restaurant-finish">
        <span className="restaurant-finish-icon">
          <Check size={34} />
        </span>
        <p className="eyebrow">HOÀN THÀNH BÀI LUYỆN</p>
        <h2>{lesson.title}</h2>
        <Stars value={stars} />
        <p>
          Lượt chơi sau sẽ đổi số liệu để em luyện cách tính chứ không học thuộc
          đáp án.
        </p>
        <button type="button" className="adventure-button" onClick={onExit}>
          Về sảnh nhà hàng <ArrowRight size={18} />
        </button>
      </section>
    )
  }

  return (
    <section className="restaurant-play">
      <header className="restaurant-play-heading">
        <button type="button" className="quiet-button" onClick={onExit}>
          <ArrowLeft size={18} /> Thoát bài
        </button>
        <span>
          Tình huống {index + 1}/{questions.length}
        </span>
      </header>

      <div className="restaurant-question-card">
        <span className="restaurant-question-icon">
          <CookingPot size={28} />
        </span>
        <p className="eyebrow">{lesson.skillLabel}</p>
        <h2>{question.prompt}</h2>

        <label htmlFor="restaurant-answer">Câu trả lời của em</label>
        <div className="restaurant-answer">
          <input
            id="restaurant-answer"
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
          <div className="restaurant-hint" role="status">
            <Sparkles size={17} />
            <span>{feedback}</span>
          </div>
        ) : (
          <p className="restaurant-tip">
            Tính chậm mà chắc. Bếp cần đúng số lượng hơn là đoán thật nhanh.
          </p>
        )}

        <button
          type="button"
          className="adventure-button restaurant-submit"
          disabled={!answer.trim()}
          onClick={submit}
        >
          Kiểm tra <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

function DinnerRush({
  run,
  onExit,
  onFinish,
}: {
  run: RestaurantRushRun
  onExit: () => void
  onFinish: (stars: number) => void
}) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [satisfaction, setSatisfaction] = useState(0)
  const [waste, setWaste] = useState(0)
  const [time, setTime] = useState(0)
  const [consequence, setConsequence] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const round = run.rounds[roundIndex]

  const choose = (choice: (typeof round.choices)[number]) => {
    setRevenue((current) => current + choice.revenueDelta)
    setSatisfaction((current) => current + choice.satisfactionDelta)
    setWaste((current) => current + choice.wasteDelta)
    setTime((current) => current + choice.timeDelta)
    setConsequence(choice.consequence)
  }

  const next = () => {
    if (roundIndex < run.rounds.length - 1) {
      setRoundIndex((current) => current + 1)
      setConsequence(null)
      return
    }

    const stars = scoreRestaurantRush(
      run,
      revenue,
      satisfaction,
      waste,
      time,
    )
    setFinished(true)
    onFinish(stars)
  }

  if (finished) {
    const stars = scoreRestaurantRush(
      run,
      revenue,
      satisfaction,
      waste,
      time,
    )
    const passed = stars >= 3

    return (
      <section className="restaurant-play restaurant-finish">
        <span className={passed ? 'restaurant-finish-icon' : 'restaurant-retry-icon'}>
          {passed ? <Check size={34} /> : <RotateCcw size={34} />}
        </span>
        <p className="eyebrow">KẾT CA GIỜ CAO ĐIỂM</p>
        <h2>{passed ? 'Nhà hàng đã vượt qua ca đông!' : 'Ca này còn hơi chao đảo'}</h2>
        <Stars value={stars} />

        <div className="restaurant-result-grid">
          <div>
            <Coins size={19} />
            <span>Doanh thu</span>
            <strong>{money.format(revenue)}đ</strong>
            <small>Mục tiêu {money.format(run.targetRevenue)}đ</small>
          </div>
          <div>
            <UsersRound size={19} />
            <span>Khách hài lòng</span>
            <strong>{satisfaction} điểm</strong>
            <small>Phản ánh cách em phục vụ nhu cầu thật.</small>
          </div>
          <div>
            <Trash2 size={19} />
            <span>Lãng phí</span>
            <strong>{waste} điểm</strong>
            <small>Càng thấp càng tốt.</small>
          </div>
          <div>
            <Clock3 size={19} />
            <span>Áp lực thời gian</span>
            <strong>{time} điểm</strong>
            <small>Càng thấp, ca càng trôi chảy.</small>
          </div>
        </div>

        <p className="restaurant-result-note">
          Một nhà hàng tốt không chỉ kiếm nhiều tiền. Em còn phải để ý khách,
          thời gian và lượng đồ ăn bị bỏ đi.
        </p>

        <button type="button" className="adventure-button" onClick={onExit}>
          Về sảnh nhà hàng <ArrowRight size={18} />
        </button>
      </section>
    )
  }

  return (
    <section className="restaurant-play restaurant-rush">
      <header className="restaurant-play-heading">
        <button type="button" className="quiet-button" onClick={onExit}>
          <ArrowLeft size={18} /> Thoát ca
        </button>
        <span>
          Tình huống {roundIndex + 1}/{run.rounds.length}
        </span>
      </header>

      <div className="restaurant-live-metrics">
        <div><Coins size={17} /><span>Doanh thu</span><strong>{money.format(revenue)}đ</strong></div>
        <div><UsersRound size={17} /><span>Hài lòng</span><strong>{satisfaction}</strong></div>
        <div><Trash2 size={17} /><span>Lãng phí</span><strong>{waste}</strong></div>
        <div><Clock3 size={17} /><span>Thời gian</span><strong>{time}</strong></div>
      </div>

      <div className="restaurant-story">
        <span className="restaurant-story-icon"><ChefHat size={30} /></span>
        <div>
          <p className="eyebrow">{round.title}</p>
          <h2>{round.story}</h2>
          <p>
            Không có lựa chọn nào hiện điểm ngay. Hãy nghĩ xem điều gì sẽ xảy
            ra với cả bếp và khách.
          </p>
        </div>
      </div>

      {!consequence ? (
        <div className="restaurant-choice-grid">
          {round.choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => choose(choice)}>
              <span className="restaurant-choice-mark" />
              <strong>{choice.label}</strong>
              <small>{choice.description}</small>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      ) : (
        <div className="restaurant-consequence" role="status">
          <Sparkles size={22} />
          <div>
            <strong>Điều xảy ra sau đó</strong>
            <p>{consequence}</p>
          </div>
          <button type="button" className="adventure-button" onClick={next}>
            {roundIndex < run.rounds.length - 1 ? 'Phục vụ bàn tiếp' : 'Kết ca'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  )
}

export function HappyRestaurantScreen({ onBack }: { onBack: () => void }) {
  const completedLessonIds = useRestaurantProgressStore(
    (state) => state.completedLessonIds,
  )
  const bestStarsByLessonId = useRestaurantProgressStore(
    (state) => state.bestStarsByLessonId,
  )
  const nextRun = useRestaurantProgressStore((state) => state.nextRun)
  const completeLesson = useRestaurantProgressStore((state) => state.completeLesson)

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
    useState<RestaurantLessonId | null>(null)
  const [runSeed, setRunSeed] = useState(1)

  const chapterCompleted =
    completedWorldChapterIds.includes('happy-restaurant')
  const coreCompleted = restaurantLessons
    .slice(0, 3)
    .every((lesson) => completedLessonIds.includes(lesson.id))

  const startLesson = (lessonId: RestaurantLessonId) => {
    const run = nextRun(lessonId)
    const lessonIndex = restaurantLessons.findIndex((item) => item.id === lessonId)
    setRunSeed(20261001 + run * 8191 + lessonIndex * 65537)
    setActiveLessonId(lessonId)
  }

  const finishLesson = (lessonId: RestaurantLessonId, stars: number) => {
    const passed = lessonId !== 'dinner-rush' || stars >= 3
    const lesson = restaurantLessons.find((item) => item.id === lessonId)!

    recordActivityResult(
      'happy-restaurant:' + lessonId + ':v1',
      stars,
      stars * 20,
    )

    if (!passed) return

    completeLesson(lessonId, stars)
    awardXpOnce('happy-restaurant:' + lessonId, lesson.xpReward)

    if (lessonId === 'dinner-rush') {
      completeWorldChapter('happy-restaurant')
      awardXpOnce('happy-restaurant:chapter:v1', 90)
      claimChallengeReward('happy-restaurant:chapter:v1', 90)
    }
  }

  if (activeLessonId && activeLessonId !== 'dinner-rush') {
    return (
      <RestaurantQuiz
        key={activeLessonId + ':' + runSeed}
        lessonId={activeLessonId}
        seed={runSeed}
        onExit={() => setActiveLessonId(null)}
        onComplete={(stars) => finishLesson(activeLessonId, stars)}
      />
    )
  }

  if (activeLessonId === 'dinner-rush') {
    return (
      <DinnerRush
        key={'rush:' + runSeed}
        run={createRestaurantRush(runSeed)}
        onExit={() => setActiveLessonId(null)}
        onFinish={(stars) => finishLesson('dinner-rush', stars)}
      />
    )
  }

  return (
    <section className="happy-restaurant-screen">
      <div className="restaurant-toolbar">
        <button type="button" className="quiet-button" onClick={onBack}>
          <ArrowLeft size={18} /> Bản đồ
        </button>
        <span>{completedLessonIds.length}/4 chặng</span>
      </div>

      <header className="restaurant-hero">
        <div>
          <p className="eyebrow">
            <ChefHat size={16} /> NHÀ HÀNG VUI VẺ
          </p>
          <h1>Mỗi bàn ăn là một bài toán nhỏ.</h1>
          <p>
            Chia phần vừa đủ, tính hóa đơn chính xác và học cách phục vụ mà
            không biến thức ăn thành đồ bỏ đi.
          </p>
          <div className="restaurant-hero-tags">
            <span><UsersRound size={15} /> Chia khẩu phần</span>
            <span><ReceiptText size={15} /> Hóa đơn</span>
            <span><Trash2 size={15} /> Giảm lãng phí</span>
          </div>
        </div>
        <div className="restaurant-hero-art">
          <img src={gameAssets.production.maps['happy-restaurant']} alt="" />
          <span>{chapterCompleted ? 'Đã hoàn thành chương' : 'Bếp đang chờ em'}</span>
        </div>
      </header>

      {chapterCompleted ? (
        <div className="restaurant-chapter-banner">
          <Sparkles size={24} />
          <div>
            <strong>Nhà hàng vui vẻ đã hoàn thành!</strong>
            <span>Chợ cuối tuần sẽ mở khi em đạt đủ cấp độ.</span>
          </div>
        </div>
      ) : null}

      <div className="restaurant-room-grid">
        {restaurantLessons.map((lesson, index) => {
          const Icon = lessonIcons[lesson.id]
          const previous = restaurantLessons[index - 1]
          const unlocked =
            index === 0 ||
            (lesson.id === 'dinner-rush'
              ? coreCompleted
              : Boolean(previous && completedLessonIds.includes(previous.id)))
          const completed = completedLessonIds.includes(lesson.id)
          const stars = bestStarsByLessonId[lesson.id] ?? 0

          return (
            <article
              key={lesson.id}
              className={
                'restaurant-room restaurant-room-' +
                (index + 1) +
                ' ' +
                (unlocked ? 'is-open' : 'is-locked')
              }
            >
              <span className="restaurant-room-index">
                {lesson.id === 'dinner-rush' ? 'MISSION' : '0' + (index + 1)}
              </span>
              <span className="restaurant-room-icon"><Icon size={32} /></span>
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
                  ? 'Chơi lại với bàn mới'
                  : unlocked
                    ? lesson.id === 'dinner-rush'
                      ? 'Bắt đầu giờ cao điểm'
                      : 'Vào khu vực'
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

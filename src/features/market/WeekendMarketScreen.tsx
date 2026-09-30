import { useState } from 'react'
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
  Store,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import {
  createMarketDay,
  createWeekendMarketQuiz,
  scoreMarketDay,
  weekendMarketChapter,
  weekendMarketLessons,
  type MarketDayRun,
  type WeekendMarketLessonId,
} from '../../data/weekendMarket'
import { useWeekendMarketProgressStore } from '../../store/weekendMarketProgress'
import {
  WorldChapterQuiz,
  WorldChapterStars,
} from '../world/WorldChapterQuiz'
import { useWorldChapterController } from '../world/useWorldChapterController'

const money = new Intl.NumberFormat('vi-VN')

const lessonIcons = {
  'unit-price': Scale,
  'profit-loss': Coins,
  'fair-bargain': HandCoins,
  'market-day': Store,
} satisfies Record<WeekendMarketLessonId, typeof Store>

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
        <WorldChapterStars value={stars} className="market-stars" />

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
  const {
    activeLessonId,
    setActiveLessonId,
    runSeed,
    chapterCompleted,
    completedLessonIds,
    bestStarsByLessonId,
    startLesson,
    finishLesson,
    isLessonUnlocked,
  } = useWorldChapterController({
    chapter: weekendMarketChapter,
    lessons: weekendMarketLessons,
    progressStore: useWeekendMarketProgressStore,
  })

  if (activeLessonId && activeLessonId !== 'market-day') {
    const lesson = weekendMarketLessons.find((item) => item.id === activeLessonId)!

    return (
      <WorldChapterQuiz
        key={activeLessonId + ':' + runSeed}
        theme="market"
        lessonTitle={lesson.title}
        skillLabel={lesson.skillLabel}
        questions={createWeekendMarketQuiz(activeLessonId, runSeed)}
        icon={ShoppingBasket}
        copy={{
          exitLabel: 'Thoát bài',
          counterLabel: 'Bài',
          inputLabel: 'Kết quả của em',
          inputPlaceholder: 'Nhập kết quả',
          idleTip: 'So sánh theo cùng một đơn vị trước khi quyết định.',
          correctFeedback: 'Chuẩn rồi! Sang lượt tính tiếp theo nhé.',
          completeEyebrow: 'HOÀN THÀNH BÀI LUYỆN',
          completeDescription:
            'Lượt sau số liệu sẽ đổi, nên em phải hiểu cách tính chứ không thể nhớ đáp án cũ.',
          backLabel: 'Về khu chợ',
        }}
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
          const unlocked = isLessonUnlocked(lesson.id)
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
              {stars ? <WorldChapterStars value={stars} className="market-stars" /> : null}
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

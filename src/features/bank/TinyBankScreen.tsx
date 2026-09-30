import { useState } from 'react'
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
  Target,
  TrendingUp,
} from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import {
  createTinyBankMission,
  createTinyBankQuiz,
  scoreTinyBankMission,
  tinyBankChapter,
  tinyBankLessons,
  type TinyBankLessonId,
  type TinyBankMissionRun,
} from '../../data/tinyBank'
import { useTinyBankProgressStore } from '../../store/tinyBankProgress'
import {
  WorldChapterQuiz,
  WorldChapterStars,
} from '../world/WorldChapterQuiz'
import { useWorldChapterController } from '../world/useWorldChapterController'

const money = new Intl.NumberFormat('vi-VN')

const lessonIcons = {
  'saving-goal': Target,
  'balance-counter': Banknote,
  'growth-bonus': TrendingUp,
  'four-week-mission': ShieldCheck,
} satisfies Record<TinyBankLessonId, typeof Target>

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
        <WorldChapterStars value={stars} className="bank-stars" />
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
    chapter: tinyBankChapter,
    lessons: tinyBankLessons,
    progressStore: useTinyBankProgressStore,
  })

  if (activeLessonId && activeLessonId !== 'four-week-mission') {
    const lesson = tinyBankLessons.find((item) => item.id === activeLessonId)!

    return (
      <WorldChapterQuiz
        key={activeLessonId + ':' + runSeed}
        theme="bank"
        lessonTitle={lesson.title}
        skillLabel={lesson.skillLabel}
        questions={createTinyBankQuiz(activeLessonId, runSeed)}
        icon={CircleDollarSign}
        copy={{
          exitLabel: 'Thoát bài',
          counterLabel: 'Câu',
          inputLabel: 'Câu trả lời của em',
          inputPlaceholder: 'Nhập số tiền',
          idleTip: 'Em có thể nháp từng bước trước khi nhập kết quả.',
          correctFeedback: 'Chính xác. Em đã theo dõi dòng tiền rất tốt.',
          completeEyebrow: 'HOÀN THÀNH BÀI LUYỆN',
          completeDescription:
            'Lần sau số tiền sẽ đổi để em luyện cách suy nghĩ thay vì nhớ đáp án.',
          backLabel: 'Về sảnh ngân hàng',
        }}
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
          const unlocked = isLessonUnlocked(lesson.id)
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
              {stars ? <WorldChapterStars value={stars} className="bank-stars" /> : null}
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

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, NotebookPen, PiggyBank, RotateCcw, ShieldCheck, Sparkles, Target } from 'lucide-react'
import { scoreTinyBankMission, tinyBankChapter, type TinyBankMissionRun } from '../../data/tinyBank'
import { chooseBankPlan, restoreBankPlan, summarizeBankPlan, type BankPlanProgress } from '../../domain/tinyBankMission'
import { WorldChapterStars } from '../world/WorldChapterQuiz'

const money = (value: number) => value.toLocaleString('vi-VN') + 'đ'

export function BankMission({ run, checkpoint, onCheckpoint, onExit, onFinish }: {
  run: TinyBankMissionRun
  checkpoint: unknown
  onCheckpoint: (value: BankPlanProgress) => void
  onExit: () => void
  onFinish: (stars: number) => void
}) {
  const [progress, setProgress] = useState(() => restoreBankPlan(run, checkpoint))
  const current = useRef(progress)
  const [finished, setFinished] = useState(false)
  const finishOnce = useRef(false)
  const storyRef = useRef<HTMLHeadingElement>(null)
  const choiceResultRef = useRef<HTMLHeadingElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const { savings, reserve, joy, ledger } = summarizeBankPlan(run, progress)
  const roundIndex = progress.choiceIds.length - (progress.reviewing ? 1 : 0)
  const round = run.rounds[roundIndex]
  const lastEntry = ledger.at(-1)
  const stars = scoreTinyBankMission(run, savings, reserve, joy)
  const passed = stars >= tinyBankChapter.finalMinStars
  useEffect(() => {
    const target = finished ? titleRef.current : progress.reviewing ? choiceResultRef.current : storyRef.current
    target?.focus()
  }, [finished, progress.reviewing, progress.choiceIds.length])

  const commit = (next: BankPlanProgress) => {
    current.current = next
    setProgress(next)
    onCheckpoint(next)
  }
  const next = () => {
    if (!current.current.reviewing || finishOnce.current) return
    if (current.current.choiceIds.length < run.rounds.length) {
      commit({ ...current.current, reviewing: false })
    } else {
      finishOnce.current = true
      onFinish(stars)
      setFinished(true)
    }
  }

  return <section className="bank-play-panel bank-planner" aria-labelledby="bank-plan-title">
    <header className="bank-play-heading">
      <button type="button" className="quiet-button" onClick={onExit}><ArrowLeft size={18} /> Về sảnh ngân hàng</button>
      <span>{finished ? 'Kết quả kế hoạch' : `Tuần ${roundIndex + 1}/${run.rounds.length} · Đã lưu trên thiết bị`}</span>
    </header>
    <div className="bank-plan-heading">
      <p className="eyebrow"><NotebookPen size={17} /> SỔ TIẾT KIỆM CỦA EM</p>
      <h1 id="bank-plan-title" ref={titleRef} tabIndex={-1}>{finished ? passed ? 'Kế hoạch của em đã hoàn thành!' : 'Cùng thử một kế hoạch khác nhé' : 'Bốn tuần, từng bước nhỏ.'}</h1>
      <p>{finished ? 'Nhìn lại các khoản đã để dành và cách em giữ quỹ dự phòng.' : 'Lập kế hoạch với số tiền trong bài. Mỗi lựa chọn là một cách phân chia khác nhau.'}</p>
    </div>
    <div className="bank-mission-stats">
      <div><Target size={20} /><span>Mục tiêu</span><strong>{money(run.goal)}</strong></div>
      <div><PiggyBank size={20} /><span>Đã để dành</span><strong>{money(savings)}</strong></div>
      <div><ShieldCheck size={20} /><span>Dự phòng</span><strong>{money(reserve)}</strong></div>
    </div>
    <div className="bank-goal-track">
      <label htmlFor="bank-goal-progress">{savings >= run.goal ? 'Đã chạm mục tiêu tiết kiệm' : `Còn ${money(run.goal - savings)} để chạm mục tiêu`}</label>
      <progress id="bank-goal-progress" value={Math.min(savings, run.goal)} max={run.goal} />
    </div>
    {finished ? <div className="bank-plan-outcome" role="status">
      {passed ? <Check size={30} /> : <RotateCcw size={30} />}
      <WorldChapterStars value={stars} />
      <p>Quỹ dự phòng: {reserve >= 15_000 ? 'vẫn còn khoản an toàn.' : 'cần được bổ sung ở kế hoạch sau.'} Em đã dành chỗ cho {joy} điểm cân bằng trong kế hoạch.</p>
      <p>Đây là kết quả kế hoạch mô phỏng, không phải điểm bài Toán. Đạt {tinyBankChapter.finalMinStars} sao để hoàn thành chặng.</p>
      <button type="button" className="adventure-button" onClick={onExit}>Về sảnh ngân hàng <ArrowRight size={18} /></button>
    </div> : <>
      <ol className="bank-week-track" aria-label="Tiến trình kế hoạch">
        {run.rounds.map((item, index) => <li key={item.id} aria-current={index === roundIndex ? 'step' : undefined}>
          {index < roundIndex ? <Check size={17} aria-hidden="true" /> : <span>{index + 1}</span>} Tuần {index + 1}
        </li>)}
      </ol>
      <div className="bank-story-card"><p className="eyebrow">{round.title}</p><h2 ref={storyRef} tabIndex={-1}>{round.story}</h2></div>
      {!progress.reviewing ? <div className="bank-choice-grid">
        {round.choices.map(choice => <button key={choice.id} type="button" onClick={() => {
          const nextProgress = chooseBankPlan(run, current.current, choice.id)
          if (nextProgress !== current.current) commit(nextProgress)
        }}>
          <span className="bank-choice-dot" aria-hidden="true" /><strong>{choice.label}</strong><small>{choice.description}</small><ArrowRight size={18} aria-hidden="true" />
        </button>)}
      </div> : <div className="bank-consequence" role="status">
        <Sparkles size={22} aria-hidden="true" /><div><h2 className="bank-choice-result-title" ref={choiceResultRef} tabIndex={-1}>{lastEntry?.choice.label}</h2><p>{lastEntry?.choice.consequence}</p></div>
        <button type="button" className="adventure-button" onClick={next}>{progress.choiceIds.length < run.rounds.length ? 'Sang tuần tiếp' : 'Xem kết quả'}<ArrowRight size={18} /></button>
      </div>}
    </>}
    <details className="bank-passbook" open={finished || undefined}>
      <summary><NotebookPen size={19} /> Sổ theo dõi · {ledger.length} tuần đã chọn</summary>
      <p>Khởi đầu: {money(run.startingSavings)} tiết kiệm · {money(run.startingReserve)} dự phòng.</p>
      {ledger.length ? <ol>{ledger.map(entry => <li key={entry.week}>
        <span>Tuần {entry.week}</span><div><strong>{entry.choice.label}</strong><p>Để dành thêm {money(entry.choice.savingsDelta)} · Dự phòng {entry.choice.reserveDelta < 0 ? 'dùng ' + money(-entry.choice.reserveDelta) : 'giữ nguyên'}</p></div>
        <strong>{money(entry.savings)}<small>Tổng đã để dành</small></strong>
      </li>)}</ol> : <p>Lựa chọn đầu tiên của em sẽ được ghi ở đây.</p>}
    </details>
  </section>
}

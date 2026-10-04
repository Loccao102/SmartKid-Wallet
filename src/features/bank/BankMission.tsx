import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, Banknote, Check, CheckCircle2, NotebookPen, PiggyBank, RotateCcw, ShieldCheck, Target } from 'lucide-react'
import { scoreTinyBankMission, tinyBankChapter, type TinyBankMissionRun } from '../../data/tinyBank'
import { chooseBankPlan, restoreBankPlan, summarizeBankPlan, type BankPlanProgress } from '../../domain/tinyBankMission'
import { WorldChapterStars } from '../world/WorldChapterQuiz'
import './bank-planner-play.css'

const money = (value: number) => value.toLocaleString('vi-VN') + 'đ'

export function BankMission({ run, checkpoint, onCheckpoint, onExit, onFinish }: {
  run: TinyBankMissionRun
  checkpoint: unknown
  onCheckpoint: (value: BankPlanProgress) => void
  onExit: () => void
  onFinish: (stars: number) => void
}) {
  const [progress, setProgress] = useState(() => restoreBankPlan(run, checkpoint))
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
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
  const selectedChoice = round?.choices.find(choice => choice.id === selectedChoiceId)
  const goalPercent = Math.min(100, Math.max(0, savings / run.goal * 100))
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
      setSelectedChoiceId(null)
      commit({ ...current.current, reviewing: false })
    } else {
      finishOnce.current = true
      onFinish(stars)
      setFinished(true)
    }
  }
  const confirmChoice = () => {
    if (!selectedChoice || finishOnce.current) return
    const nextProgress = chooseBankPlan(run, current.current, selectedChoice.id)
    if (nextProgress === current.current) return
    commit(nextProgress)
    setSelectedChoiceId(null)
  }

  return <section className="bank-play-panel bank-planner bank-planner-play" aria-labelledby="bank-plan-title">
    <header className="bank-play-heading">
      <button type="button" className="quiet-button" onClick={onExit}><ArrowLeft size={18} /> Về sảnh ngân hàng</button>
      <span>{finished ? 'Kết quả kế hoạch' : `Tuần ${roundIndex + 1}/${run.rounds.length} · ${selectedChoice ? 'Chưa xác nhận lựa chọn' : 'Đã lưu trên thiết bị'}`}</span>
    </header>
    <div className="bank-plan-heading">
      <p className="eyebrow"><NotebookPen size={17} /> SỔ TIẾT KIỆM CỦA EM</p>
      <h1 id="bank-plan-title" ref={titleRef} tabIndex={-1}>{finished ? passed ? 'Kế hoạch của em đã hoàn thành!' : 'Cùng thử một kế hoạch khác nhé' : 'Bốn tuần, từng bước nhỏ.'}</h1>
      <p>{finished ? 'Nhìn lại các khoản đã để dành và cách em giữ quỹ dự phòng.' : 'Chọn cách chia tiền, ghi vào sổ và nhìn ước mơ lớn dần qua từng tuần.'}</p>
    </div>
    <ol className="bank-week-track bank-desk-weeks" aria-label="Tiến trình kế hoạch">
      {run.rounds.map((item, index) => <li key={item.id} className={index < progress.choiceIds.length ? 'is-recorded' : undefined} aria-current={!finished && index === roundIndex ? 'step' : undefined}>
        <span>{index < progress.choiceIds.length ? <Check size={17} aria-hidden="true" /> : index + 1}</span> Tuần {index + 1}
        {index < progress.choiceIds.length ? <span className="bank-assistive-text">đã ghi</span> : null}
      </li>)}
    </ol>
    <div className={'bank-plan-desk' + (finished ? ' is-finished' : '')}>
      {!finished ? <div className="bank-desk-story">
        <p className="eyebrow">{round.title}</p>
        <h2 ref={storyRef} tabIndex={-1}>{round.story}</h2>
        <div className="bank-week-income"><Banknote size={22} aria-hidden="true" /><span>Tiền tuần này<strong>{money(round.income)}</strong></span><small>Tiền trong bài mô phỏng</small></div>
      </div> : null}
      <aside className="bank-desk-funds" aria-label="Tiền đã ghi trong sổ">
        <div className="bank-savings-vessel">
          <p><PiggyBank size={20} aria-hidden="true" /> Hũ mục tiêu</p>
          <div className="bank-savings-jar" role="progressbar" aria-label="Tiến tới mục tiêu tiết kiệm" aria-valuemin={0} aria-valuemax={run.goal} aria-valuenow={Math.min(savings, run.goal)} aria-valuetext={`${money(savings)} trên mục tiêu ${money(run.goal)}`} style={{ '--bank-jar-fill': `${goalPercent}%` } as CSSProperties}>
            <div className="bank-savings-fill" aria-hidden="true" />
            <span className="bank-savings-emblem" aria-hidden="true"><Target size={34} /></span>
          </div>
          <strong className="bank-savings-total" aria-label={`Đã để dành ${money(savings)}`}>{money(savings)}</strong>
          <span>Mục tiêu {money(run.goal)}</span>
          <small>{savings >= run.goal ? 'Đã chạm mục tiêu tiết kiệm' : `Còn ${money(run.goal - savings)} để chạm mục tiêu`}</small>
        </div>
        <div className="bank-reserve-box"><ShieldCheck size={25} aria-hidden="true" /><div><span>Hộp dự phòng</span><strong aria-label={`Dự phòng còn ${money(reserve)}`}>{money(reserve)}</strong></div></div>
        <p className="bank-desk-money-note">Tiền trong sổ tách biệt với xu của em.</p>
      </aside>
      {finished ? <div className="bank-plan-outcome" role="status">
        {passed ? <CheckCircle2 size={36} aria-hidden="true" /> : <RotateCcw size={36} aria-hidden="true" />}
        <WorldChapterStars value={stars} />
        <p>Quỹ dự phòng: {reserve >= 15_000 ? 'vẫn còn khoản an toàn.' : 'cần được bổ sung ở kế hoạch sau.'} Em đã dành chỗ cho {joy} điểm cân bằng trong kế hoạch.</p>
        <p>Đây là kết quả kế hoạch mô phỏng, không phải điểm bài Toán. Đạt {tinyBankChapter.finalMinStars} sao để hoàn thành chặng.</p>
        <button type="button" className="adventure-button" onClick={onExit}>Về sảnh ngân hàng <ArrowRight size={18} /></button>
      </div> : <div className="bank-desk-decisions">
        {!progress.reviewing ? <>
          <h3 id="bank-choice-heading">Tuần này, em muốn chia thế nào?</h3>
          <div className="bank-plan-options" role="group" aria-labelledby="bank-choice-heading">
            {round.choices.map(choice => <button key={choice.id} type="button" aria-pressed={choice.id === selectedChoiceId} aria-label={choice.label} aria-describedby={'bank-choice-description-' + choice.id} onClick={() => setSelectedChoiceId(choice.id)}>
              <span className="bank-plan-option-check" aria-hidden="true">{choice.id === selectedChoiceId ? <Check size={18} /> : null}</span>
              <span><strong>{choice.label}</strong><small id={'bank-choice-description-' + choice.id}>{choice.description}</small></span>
            </button>)}
          </div>
          <div className="bank-plan-preview" role="status" aria-live="polite" aria-atomic="true">
            {selectedChoice ? <><p>Nếu chọn “{selectedChoice.label}”</p><dl>
              <div><dt>Để dành thêm</dt><dd>{money(selectedChoice.savingsDelta)}</dd></div>
              <div><dt>Dự phòng</dt><dd>{selectedChoice.reserveDelta < 0 ? 'Dùng ' + money(-selectedChoice.reserveDelta) : 'Giữ nguyên'}</dd></div>
            </dl><small>Em có thể đổi lựa chọn trước khi xác nhận.</small></> : <p>Chọn một phương án để xem khoản tiền sẽ ghi vào sổ.</p>}
          </div>
          <button type="button" className="adventure-button bank-confirm-plan" disabled={!selectedChoice} onClick={confirmChoice}>Xác nhận kế hoạch <NotebookPen size={19} /></button>
        </> : <div className="bank-plan-receipt" role="status">
          <span className="bank-week-stamp"><Check size={19} aria-hidden="true" /> Đã ghi tuần {roundIndex + 1}</span>
          <h2 className="bank-choice-result-title" ref={choiceResultRef} tabIndex={-1}>{lastEntry?.choice.label}</h2>
          <p>{lastEntry?.choice.consequence}</p>
          <dl><div><dt>Để dành thêm</dt><dd>{money(lastEntry!.choice.savingsDelta)}</dd></div><div><dt>Dự phòng</dt><dd>{lastEntry!.choice.reserveDelta < 0 ? 'Dùng ' + money(-lastEntry!.choice.reserveDelta) : 'Giữ nguyên'}</dd></div></dl>
          <button type="button" className="adventure-button" onClick={next}>{progress.choiceIds.length < run.rounds.length ? 'Sang tuần tiếp' : 'Xem kết quả'}<ArrowRight size={18} /></button>
        </div>}
      </div>}
    </div>
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

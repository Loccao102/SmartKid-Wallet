import { Landmark, PiggyBank, Sprout, Target } from 'lucide-react'
import type { TinyBankQuestion } from '../../data/tinyBank'
import type { WorldChapterQuizSceneState } from '../world/WorldChapterQuiz'
import './bank-quiz-scene.css'

const money = (value: number) => value.toLocaleString('vi-VN') + 'đ'

function Coin({ x, y, className = '' }: { x: number; y: number; className?: string }) {
  return (
    <g className={'bank-scene-coin ' + className} transform={`translate(${x} ${y})`}>
      <circle r="12" />
      <circle r="8" />
      <path d="M-3 0h6M0-3v6" />
    </g>
  )
}

function SavingsJar({ revealed }: { revealed: boolean }) {
  return (
    <svg className="bank-jar-drawing" viewBox="0 0 240 200" aria-hidden="true">
      <ellipse className="bank-scene-shadow" cx="120" cy="183" rx="78" ry="11" />
      <path className="bank-jar-glass" d="M77 38h86v17c0 10 18 14 18 33v66c0 18-13 27-30 27H89c-17 0-30-9-30-27V88c0-19 18-23 18-33Z" />
      <path className={'bank-jar-fill' + (revealed ? ' is-full' : '')} d="M65 88h110v64c0 16-10 23-24 23H89c-14 0-24-7-24-23Z" />
      <g className="bank-jar-given-coins">
        <Coin x={95} y={157} /><Coin x={120} y={153} /><Coin x={143} y={156} />
      </g>
      {revealed && (
        <g className="bank-jar-added-coins">
          <Coin x={108} y={132} /><Coin x={133} y={130} />
          <Coin x={96} y={110} /><Coin x={122} y={109} /><Coin x={147} y={109} />
          <Coin x={121} y={87} className="bank-jar-drop" />
        </g>
      )}
      <path className="bank-jar-shine" d="M75 86v42" />
      <rect className="bank-jar-lid" x="71" y="26" width="98" height="18" rx="7" />
      <path className="bank-jar-slot" d="M105 34h30" />
      <path className="bank-jar-ribbon" d="M168 48v34l-11-7-11 7V48" />
      <path className="bank-jar-ribbon-mark" d="m151 61 4 4 8-8" />
    </svg>
  )
}

function Teller({ revealed, withdraw }: { revealed: boolean; withdraw: boolean }) {
  return (
    <svg className="bank-teller-drawing" viewBox="0 0 320 154" aria-hidden="true">
      <ellipse className="bank-scene-shadow" cx="160" cy="142" rx="84" ry="9" />
      <path className="bank-teller-wall" d="M103 47h114v75H103Z" />
      <path className="bank-teller-roof" d="m92 44 15-27h106l15 27v11c-8 9-16 9-23 0-8 9-16 9-23 0-8 9-16 9-23 0-8 9-16 9-23 0-8 9-16 9-22 0-8 9-16 9-22 0Z" />
      <path className="bank-teller-stripes" d="m119 18-6 25m29-25-3 25m43-25 3 25m28-25 7 25" />
      <rect className="bank-teller-window" x="128" y="72" width="64" height="39" rx="9" />
      <path className="bank-teller-window-mark" d="M153 85h14m-7-7v23" />
      <rect className="bank-teller-counter" x="93" y="113" width="134" height="24" rx="8" />
      <path className="bank-transfer-path bank-transfer-in" d="M24 98c18-27 39-26 61-3m-3-12 3 12-13-1" />
      {withdraw && <path className="bank-transfer-path bank-transfer-out" d="M235 94c21-24 43-24 63 3m-12-2 12 2-1-13" />}
      <Coin x={43} y={79} className={revealed ? 'bank-transfer-coin-in' : ''} />
      {withdraw && <Coin x={270} y={77} className={revealed ? 'bank-transfer-coin-out' : ''} />}
      {revealed && <path className="bank-teller-check" d="m148 124 8 8 16-16" />}
    </svg>
  )
}

function MoneyPlant({ completedCount }: { completedCount: number }) {
  const stage = Math.min(3, Math.max(0, completedCount))
  return (
    <svg className="bank-garden-drawing" viewBox="0 0 280 195" aria-hidden="true">
      <ellipse className="bank-scene-shadow" cx="140" cy="178" rx="77" ry="10" />
      <path className="bank-garden-bed" d="M83 128h114l-15 42c-3 8-11 12-19 12h-46c-8 0-16-4-19-12Z" />
      <ellipse className="bank-garden-soil" cx="140" cy="129" rx="57" ry="12" />
      {stage === 0 && <path className="bank-garden-seed" d="M131 125c0-12 16-13 19-2-3 8-14 12-19 2Z" />}
      {stage > 0 && (
        <g className="bank-garden-growth">
          <path className="bank-garden-stem" d={stage === 1 ? 'M140 129V95' : stage === 2 ? 'M140 129V65' : 'M140 129V42'} />
          <path className="bank-garden-leaf" d="M140 109c-24 0-40-15-38-30 23-1 38 14 38 30Zm0-10c0-22 16-34 36-30 0 20-15 31-36 30Z" />
          {stage > 1 && <path className="bank-garden-leaf bank-garden-leaf-top" d="M140 77c-22-1-34-14-32-29 22 0 32 12 32 29Zm0-7c-1-19 13-31 31-29 0 20-15 29-31 29Z" />}
          {stage > 2 && <Coin x={140} y={34} className="bank-garden-bloom" />}
        </g>
      )}
      <path className="bank-garden-pot-mark" d="m130 154 7 6 13-13" />
      <path className="bank-garden-ground-leaf" d="M69 166c-11 0-18-9-16-19 13-1 21 9 16 19Zm146 1c-1-12 8-20 21-16-1 11-10 17-21 16Z" />
    </svg>
  )
}

export function BankQuizScene({ question, state }: {
  question: TinyBankQuestion
  state: WorldChapterQuizSceneState
}) {
  const visual = question.visual
  const revealed = state.isCorrect || state.finished
  // Reading the answer only after success keeps future balances and solutions out of the DOM.
  const result = revealed ? question.answer : null
  const isSaving = visual.kind === 'saving-gap' || visual.kind === 'saving-weekly'
  const title = isSaving ? 'Hũ mục tiêu' : visual.kind === 'balance' ? 'Quầy gửi · rút' : 'Vườn phần trăm'
  const Icon = isSaving ? PiggyBank : visual.kind === 'balance' ? Landmark : Sprout
  const completed = Math.min(state.totalQuestions, Math.max(0, state.completedCount))

  return (
    <figure
      className={'bank-quiz-scene' + (revealed ? ' bank-quiz-scene--revealed' : '') + (revealed && state.celebrate ? ' bank-quiz-scene--celebrate' : '')}
      data-kind={visual.kind}
      aria-label={title}
    >
      <div className="bank-scene-heading"><Icon size={21} aria-hidden="true" /><strong>{title}</strong></div>

      {visual.kind === 'saving-gap' && (
        <>
          <div className="bank-scene-goal"><Target size={16} aria-hidden="true" /><span>Mục tiêu <strong>{money(visual.goal)}</strong></span></div>
          <div className="bank-jar-stage">
            <SavingsJar revealed={revealed} />
            <p className="bank-jar-label"><span>{revealed ? 'Khi đủ mục tiêu' : 'Đang có'}</span><strong>{money(revealed ? visual.goal : visual.current)}</strong></p>
          </div>
          {result !== null ? (
            <figcaption className="bank-scene-result">Thêm <strong>{money(result)}</strong> vào {money(visual.current)} là đủ {money(visual.goal)}.</figcaption>
          ) : <figcaption className="bank-scene-instruction">Tính phần còn thiếu để lấp đầy hũ nhé.</figcaption>}
        </>
      )}

      {visual.kind === 'saving-weekly' && (
        <>
          <p className="bank-scene-weekly-total">Chia đều <strong>{money(visual.remaining)}</strong> vào {visual.weeks} tuần</p>
          <div className="bank-week-envelopes" aria-label="Các phần tiết kiệm bằng nhau">
            {Array.from({ length: visual.weeks }, (_, index) => (
              <div className="bank-week-envelope" key={index}>
                <span>Tuần {index + 1}</span>
                <strong>{result !== null ? money(result) : '?'}</strong>
              </div>
            ))}
          </div>
          {result !== null ? (
            <figcaption className="bank-scene-result"><strong>{money(result)}</strong> × {visual.weeks} tuần = {money(visual.remaining)}. Mỗi tuần một phần bằng nhau.</figcaption>
          ) : <figcaption className="bank-scene-instruction">Mỗi phong bì sẽ nhận cùng một số tiền.</figcaption>}
        </>
      )}

      {visual.kind === 'balance' && (
        <>
          <p className="bank-teller-balance"><span>{result !== null ? 'Số dư mới' : 'Ban đầu có'}</span><strong>{money(result !== null ? result : visual.start)}</strong></p>
          <Teller revealed={revealed} withdraw={visual.withdraw > 0} />
          <div className="bank-teller-transactions">
            <p className="bank-teller-deposit"><span>Gửi vào</span><strong>+{money(visual.deposit)}</strong></p>
            {visual.withdraw > 0 && <p className="bank-teller-withdraw"><span>Rút ra</span><strong>−{money(visual.withdraw)}</strong></p>}
          </div>
          {result !== null ? (
            <figcaption className="bank-scene-result">{money(visual.start)} + {money(visual.deposit)}{visual.withdraw > 0 ? ' − ' + money(visual.withdraw) : ''} = <strong>{money(result)}</strong>.</figcaption>
          ) : <figcaption className="bank-scene-instruction">Theo dõi tiền vào, tiền ra để tìm số dư mới.</figcaption>}
        </>
      )}

      {visual.kind === 'growth' && (
        <>
          <div className="bank-garden-givens"><span>Khoản mô phỏng<strong>{money(visual.amount)}</strong></span><span>Được thêm<strong>{visual.rate}%</strong></span></div>
          <div className="bank-garden-stage" data-completed-count={completed}>
            <MoneyPlant completedCount={completed} />
            <p className="bank-garden-progress">Cây đã lớn {completed}/{state.totalQuestions} bước</p>
          </div>
          {result !== null ? (
            <figcaption className="bank-scene-result">{money(visual.amount)} × {visual.rate} ÷ 100 = <strong>{money(result)}</strong> được thêm.</figcaption>
          ) : <figcaption className="bank-scene-instruction">Mỗi câu hoàn thành giúp cây lớn một bước.</figcaption>}
        </>
      )}
      <p className="bank-scene-simulation">Minh họa bài Toán · tiền mô phỏng</p>
    </figure>
  )
}

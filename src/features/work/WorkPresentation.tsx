import { lazy, Suspense, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Boxes, Check, CircleAlert, Coins, ReceiptText, RotateCcw, ShieldCheck, Star, Store, Users, Wallet, X } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import { getWorkManagerPlan, workManagerPlans } from '../../data/workManagerPlans'
import { getWorkScenario } from '../../data/workShift'
import { scoreWorkShift } from '../../domain/scoring'
import type { WorkManagerPlanDefinition, WorkPendingFollowUp, WorkScenarioChoice, WorkShiftDefinition, WorkShiftProgress, WorkStoryFollowUpChoice } from '../../domain/types'
import { money } from '../smartmart/ShoppingProducts'

const WorkModeGame = lazy(() => import('../../game/WorkModeGame'))

function SimulationMetrics({ progress }: { progress: WorkShiftProgress }) {
  return <div className="simulation-metrics"><div><Star size={22} /><span>Đánh giá nhân viên<strong>{progress.metrics.employeeRating.toFixed(1)}/5</strong></span></div><div><Store size={22} /><span>Uy tín cửa hàng<strong>{progress.metrics.storeReputation.toFixed(1)}/5</strong></span></div><div><Users size={22} /><span>Hài lòng khách<strong>{progress.metrics.customerSatisfaction.toFixed(1)}/5</strong></span></div><div><Wallet size={22} /><span>Doanh thu<strong>{money.format(progress.metrics.revenue)}đ</strong></span></div></div>
}

export function ManagerPlanScreen({
  shift,
  onBack,
  onSelectPlan,
}: {
  shift: WorkShiftDefinition
  onBack: () => void
  onSelectPlan: (plan: WorkManagerPlanDefinition) => void
}) {
  return (
    <section className="manager-plan-screen">
      <button type="button" className="quiet-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Nhiệm vụ
      </button>
      <header className="manager-plan-heading">
        <div>
          <p className="eyebrow">SHIFT MANAGER · LẬP KẾ HOẠCH TRƯỚC CA</p>
          <h1>{shift.title}</h1>
          <p>
            Em chỉ có đủ nguồn lực để ưu tiên một khu vực. Kế hoạch đã chọn sẽ
            giúp chặn một sự cố tương ứng trong ca, sau đó nguồn lực đó sẽ được
            xem là đã sử dụng.
          </p>
        </div>
        <ShieldCheck size={54} aria-hidden="true" />
      </header>
      <div className="manager-plan-grid">
        {workManagerPlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className="manager-plan-card"
            onClick={() => onSelectPlan(plan)}
          >
            <span className="manager-plan-icon" aria-hidden="true">
              {plan.protection === 'inventory' ? (
                <Boxes size={30} />
              ) : plan.protection === 'service' ? (
                <Users size={30} />
              ) : (
                <ReceiptText size={30} />
              )}
            </span>
            <strong>{plan.title}</strong>
            <p>{plan.description}</p>
            <small>Một lớp bảo vệ · chỉ dùng được 1 lần trong ca</small>
            <span className="manager-plan-action">
              Chọn kế hoạch
              <ArrowRight size={18} />
            </span>
          </button>
        ))}
      </div>
      <p className="manager-plan-footnote">
        Không có kế hoạch hoàn hảo cho mọi tình huống. Mục tiêu là dự đoán rủi
        ro nào đáng ưu tiên trong ca đông khách.
      </p>
    </section>
  )
}

export function WorkResult({ shift, progress, onBack, onReplay }: { shift: WorkShiftDefinition; progress: WorkShiftProgress; onBack: () => void; onReplay: () => void }) {
  const entries = shift.customers.map(customer => progress.customerProgress[customer.id])
  const solved = entries.reduce((sum, item) => sum + Number(item?.totalSolved) + Number(item?.changeSolved), 0)
  const firstTry = entries.reduce((sum, item) => sum + Number(item?.totalSolved && item.totalAttempts === 1) + Number(item?.changeSolved && item.changeAttempts === 1), 0)
  const attempts = entries.reduce((sum, item) => sum + (item?.totalAttempts ?? 0) + (item?.changeAttempts ?? 0), 0)
  const scenarios = shift.customers.filter(customer => customer.scenarioId)
  const handled = scenarios.filter(customer => progress.customerProgress[customer.id]?.scenarioChoiceId).length
  const hiddenScore = scoreWorkShift(shift, progress, (id) => getWorkScenario(id))
  const managerPlan = progress.managerPlanId
    ? getWorkManagerPlan(progress.managerPlanId)
    : null
  const elapsedMs = Math.max(0, (progress.completedAtEpochMs ?? Date.now()) - (progress.startedAtEpochMs ?? Date.now()))
  return <section className="work-result-production"><button type="button" className="quiet-button" onClick={onBack}><ArrowLeft size={18} />Nhiệm vụ của em</button><header><img src={gameAssets.production.employee} alt="Nhân viên SmartMart" /><div><p className="eyebrow">MỘT CA LÀM, THÊM NHIỀU TRẢI NGHIỆM</p><h1>Hoàn thành ca làm!</h1><p>{shift.title} · {progress.metrics.servedCustomers}/{shift.customers.length} khách đã phục vụ</p></div><BadgeCheck size={58} aria-hidden="true" /></header>
    <section className="work-mastery-result"><div className="run-stars" aria-label={hiddenScore.stars + ' trên 5 sao'}>{Array.from({length:5},(_,index)=><Star key={index} size={31} className={index < hiddenScore.stars ? 'is-earned' : ''} />)}</div><strong>{hiddenScore.stars === 5 ? 'Ca làm 5 sao!' : 'Kỷ lục của lượt này: ' + hiddenScore.stars + '/5 sao'}</strong><span>{Math.floor(elapsedMs / 60000)} phút {Math.floor((elapsedMs % 60000) / 1000)} giây</span></section>
    <section className="work-learning-results" aria-labelledby="work-learning-title"><h2 id="work-learning-title">Kết quả học tập và làm việc</h2><div className="learning-result-grid"><div><ReceiptText size={26} /><strong>{solved}/{shift.customers.length * 2}</strong><span>Phép tính hoàn thành</span><small>{firstTry} đúng ngay lần đầu · {attempts} lượt thử</small></div><div><Check size={26} /><strong>{handled}/{scenarios.length}</strong><span>Tình huống đã xử lý</span><small>Mỗi lựa chọn mang lại một kết quả riêng.</small></div><div><CircleAlert size={26} /><strong>{progress.worldState.resolvedConsequences.length}</strong><span>Hệ quả đã xảy ra</span><small>{progress.worldState.resolvedFollowUps.length} lần em đã xử lý tiếp câu chuyện.</small></div></div></section>
    <section className="run-score-breakdown" aria-label="Các yếu tố tạo nên số sao"><span>Chính xác<strong>{Math.round(hiddenScore.accuracy)}/30</strong></span><span>Thời gian<strong>{Math.round(hiddenScore.time)}/20</strong></span><span>Vận hành<strong>{Math.round(hiddenScore.resources)}/20</strong></span><span>Quyết định<strong>{Math.round(hiddenScore.decisions)}/20</strong></span><span>Mục tiêu<strong>{Math.round(hiddenScore.objectives)}/10</strong></span></section>
    {managerPlan ? <section className="manager-plan-result"><p className="eyebrow">KẾ HOẠCH ĐẦU CA</p><h2>{managerPlan.title}</h2><p>{managerPlan.description}</p><strong>{progress.worldState.consumedManagerProtections.includes(managerPlan.protection) ? 'Nguồn lực đã được sử dụng để chặn một sự cố trong ca.' : 'Nguồn lực dự phòng không phải dùng đến trong ca này.'}</strong></section> : null}
    <section className="simulation-result-section" aria-labelledby="simulation-title"><h2 id="simulation-title">Trạng thái mô phỏng</h2><p>Các chỉ số dưới đây phản ánh cửa hàng và khách hàng, <strong>không phải điểm học tập</strong>.</p><SimulationMetrics progress={progress} /></section>
    <section className="decision-reflection"><h2>Nhìn lại lựa chọn sau khi kết ca</h2>{scenarios.map(customer => { const scenario = customer.scenarioId ? getWorkScenario(customer.scenarioId) : null; const choiceId = progress.customerProgress[customer.id]?.scenarioChoiceId; const choice = scenario?.choices.find(item => item.id === choiceId); if (!scenario || !choice) return null; return <article key={customer.id}><strong>{scenario.title}</strong><p>{choice.feedback}</p></article> })}</section>
    {progress.worldState.resolvedFollowUps.length ? <section className="consequence-reflection"><h2>Những câu chuyện em đã xử lý tiếp</h2>{progress.worldState.resolvedFollowUps.map(item => <article key={item.instanceId}><CircleAlert size={20} /><div><h3>{item.title}</h3><p>{item.feedback}</p></div></article>)}</section> : null}
    {progress.worldState.resolvedConsequences.length ? <section className="consequence-reflection"><h2>Những hệ quả đã xuất hiện</h2>{progress.worldState.resolvedConsequences.map(item => <article key={item.instanceId}><CircleAlert size={20} /><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</section> : null}
    <div className="work-result-actions"><button type="button" className="outline-button" onClick={onReplay}>Chơi lại ca làm</button><button type="button" className="adventure-button" onClick={onBack}>Tiếp tục hành trình<ArrowRight size={20} /></button></div>
  </section>
}

export function WorkCounter({ shift, progress, stage, activeFollowUp, answer, feedback, selectedChoice, baseTotal, effectiveTotal, expectedChange, coins, retryPrice, onAnswer, onSubmit, onRetry, onChoice, onFollowUpChoice, onContinue, onBack }: {
  shift: WorkShiftDefinition; progress: WorkShiftProgress; stage: 'total'|'scenario'|'change'|'done'|'follow-up'; activeFollowUp?: WorkPendingFollowUp; answer: string; feedback: 'idle'|'wrong'|'correct'; selectedChoice?: WorkScenarioChoice; baseTotal: number; effectiveTotal: number; expectedChange: number; coins: number; retryPrice: number; onAnswer: (value: string) => void; onSubmit: () => void; onRetry: () => void; onChoice: (choice: WorkScenarioChoice) => void; onFollowUpChoice: (choice: WorkStoryFollowUpChoice) => void; onContinue: () => void; onBack: () => void
}) {
  const [sceneOpen, setSceneOpen] = useState(false)
  const customer = shift.customers[progress.customerIndex]
  const scenario = customer.scenarioId ? getWorkScenario(customer.scenarioId) : null
  const orderedScenarioChoices = scenario
    ? (customer.scenarioChoiceOrder ?? scenario.choices.map((choice) => choice.id))
        .map((choiceId) => scenario.choices.find((choice) => choice.id === choiceId))
        .filter((choice): choice is WorkScenarioChoice => Boolean(choice))
    : []
  const customerProgress = progress.customerProgress[customer.id]
  const guidanceLevel = shift.guidanceLevel ?? 'guided'
  const stageAttempts =
    stage === 'change'
      ? customerProgress.changeAttempts
      : customerProgress.totalAttempts
  const taskHeading =
    stage === 'total'
      ? guidanceLevel === 'guided'
        ? 'Khách cần trả bao nhiêu?'
        : guidanceLevel === 'light'
          ? 'Kiểm tra hóa đơn'
          : 'Xử lý đơn hàng'
      : guidanceLevel === 'guided'
        ? 'Trả lại khách bao nhiêu?'
        : guidanceLevel === 'light'
          ? 'Hoàn tất thanh toán'
          : 'Khách đang chờ'
  const taskHint =
    stage === 'total'
      ? guidanceLevel === 'guided'
        ? 'Tính số lượng × đơn giá của từng món, rồi cộng lại.'
        : guidanceLevel === 'light'
          ? 'Kiểm tra các dòng hàng và hoàn tất số tiền cần thanh toán.'
          : 'Quan sát hóa đơn và xử lý bước tiếp theo như một nhân viên tại quầy.'
      : guidanceLevel === 'guided'
        ? 'Dựa vào tiền khách đưa và số tiền cần thanh toán.'
        : guidanceLevel === 'light'
          ? 'Hoàn tất giao dịch từ những dữ kiện đang có trên quầy.'
          : 'Khách đã đưa tiền. Em hãy hoàn tất giao dịch.'
  const wrongHint =
    stage === 'total'
      ? stageAttempts <= 1
        ? 'Kết quả chưa khớp. Kiểm tra xem có dòng hàng nào bị bỏ sót không.'
        : stageAttempts === 2
          ? 'Gợi ý: thành tiền mỗi dòng = số lượng × đơn giá.'
          : 'Gợi ý thêm: sau khi tính từng dòng, cộng tất cả thành tiền lại.'
      : stageAttempts <= 1
        ? 'Kết quả chưa khớp. Kiểm tra lại tiền khách đưa và số cần thanh toán.'
        : stageAttempts === 2
          ? 'Gợi ý: tiền thừa bằng tiền khách đưa trừ số cần thanh toán.'
          : 'Gợi ý thêm: thực hiện phép trừ theo từng hàng số rồi kiểm tra lại.'
  const lastConsequence = progress.worldState.resolvedConsequences.at(-1)
  return <section className="work-production"><div className="shop-toolbar"><button type="button" className="quiet-button" onClick={onBack}><ArrowLeft size={18} />Nhiệm vụ</button><span className="work-shift-chip">Khách {progress.customerIndex + 1}/{shift.customers.length}</span></div>
    <header className="work-title"><div><p className="eyebrow">ĐANG VÀO CA · {shift.roleTitle}</p><h1>{shift.title}</h1></div><span><Store size={18} />SmartMart</span></header>
    <div className="pos-layout"><section className="customer-workspace"><div className="customer-scene"><div className="store-shelves" aria-hidden="true" /><img src={gameAssets.production.customers[progress.customerIndex % gameAssets.production.customers.length]} alt="" /><div className="customer-speech"><p className="eyebrow">KHÁCH HÀNG HIỆN TẠI</p><h2>{customer.name}</h2><p>{stage === 'follow-up' && activeFollowUp ? 'Có một tình huống từ trước quay lại cần em xử lý.' : stage === 'scenario' && scenario ? (customer.scenarioDescription ?? scenario.description) : stage === 'done' ? 'Cảm ơn em đã giúp mình mua sắm!' : stage === 'change' ? 'Mình gửi em tiền thanh toán nhé.' : (customer.requestLine ?? 'Em tính giúp mình những món này nhé.')}</p></div><div className="checkout-counter-front"><ReceiptText size={24} /><span>QUẦY THU NGÂN</span></div></div>
      <div className="pos-receipt"><header><ReceiptText size={20} /><h2>Đơn hàng hiện tại</h2><span>{customer.basket.length} loại hàng</span></header><table><caption className="sr-only">Hóa đơn của {customer.name}</caption><thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{customer.basket.map(item => <tr key={item.name}><th scope="row">{item.name}</th><td>{item.quantity}</td><td>{money.format(item.unitPrice)}đ</td><td>{money.format(item.unitPrice * item.quantity)}đ</td></tr>)}</tbody></table><div className="receipt-summary"><span>Tổng tiền hàng</span><strong>{customerProgress.totalSolved ? `${money.format(baseTotal)}đ` : 'Em hãy tính nhé'}</strong></div>{selectedChoice?.billDelta ? <div className="receipt-summary"><span>Điều chỉnh hóa đơn</span><strong>{selectedChoice.billDelta > 0 ? '+' : ''}{money.format(selectedChoice.billDelta)}đ</strong></div> : null}</div>
    </section>
    <section className="pos-action" aria-label="Tác vụ tại quầy" key={`${customer.id}-${stage}`}>
      {stage === 'follow-up' && activeFollowUp ? <><p className="eyebrow">CÂU CHUYỆN QUAY LẠI</p><h2>{activeFollowUp.title}</h2><p className="pos-question">{activeFollowUp.description}</p><div className="story-followup-note"><CircleAlert size={20} /><span>Quyết định trước đó đang tạo ra một tình huống mới. Lần này em có cơ hội xử lý tiếp, không phải làm lại từ đầu.</span></div><div className="scenario-options">{activeFollowUp.choices.map((choice,index) => <button key={choice.id} type="button" onClick={() => onFollowUpChoice(choice)}><span className="choice-index">{index + 1}</span><span><strong>{choice.label}</strong><small>Ảnh hưởng của lựa chọn sẽ được tổng kết sau ca.</small></span><ArrowRight size={18} /></button>)}</div></> : stage === 'scenario' && scenario ? <><p className="eyebrow">TÌNH HUỐNG TẠI QUẦY</p><h2>{customer.scenarioTitle ?? scenario.title}</h2><p className="pos-question">Em sẽ xử lý như thế nào?</p><div className="scenario-options">{orderedScenarioChoices.map((choice,index) => <button key={choice.id} type="button" onClick={() => onChoice(choice)}><span className="choice-index">{index + 1}</span><span><strong>{choice.label}</strong>{choice.billDelta !== 0 ? <small>Hóa đơn {choice.billDelta < 0 ? 'giảm' : 'tăng'} {money.format(Math.abs(choice.billDelta))}đ</small> : <small>Giữ nguyên tổng hóa đơn</small>}</span><ArrowRight size={18} /></button>)}</div><p className="pos-hint">Hãy cân nhắc cả khách hàng và cửa hàng.</p></> : stage === 'done' ? <div className="pos-done" role="status"><BadgeCheck size={45} /><p className="eyebrow">GIAO DỊCH HOÀN TẤT</p><h2>Em đã phục vụ xong!</h2><p>Tiền thừa: <strong>{money.format(expectedChange)}đ</strong>.</p><button className="adventure-button" type="button" onClick={onContinue}>{progress.customerIndex === shift.customers.length - 1 ? 'Kết thúc ca' : 'Khách tiếp theo'}<ArrowRight size={19} /></button></div> : <>
        <p className="eyebrow">{guidanceLevel === 'guided' ? (stage === 'total' ? 'TÍNH HÓA ĐƠN' : 'TRẢ TIỀN THỪA') : 'TÁC VỤ TẠI QUẦY'}</p><h2>{taskHeading}</h2>
        {stage === 'change' ? <><div className="pos-payment"><div><span>Khách đưa</span><strong>{money.format(customer.cashGiven)}đ</strong></div><div><span>Cần thanh toán</span><strong>{money.format(effectiveTotal)}đ</strong></div></div>{selectedChoice ? <div className="decision-feedback is-neutral"><Check size={19} /><p>Lựa chọn đã được ghi nhận. Hậu quả, nếu có, sẽ xuất hiện trong quá trình ca làm.</p></div> : null}</> : <p className="pos-question">{taskHint}</p>}
        <form onSubmit={event => {event.preventDefault(); if(answer.trim()) onSubmit()}}><label htmlFor="pos-answer">{stage === 'total' ? 'Tổng hóa đơn' : 'Tiền thừa'}</label><div className="pos-input"><input id="pos-answer" inputMode="numeric" autoComplete="off" value={answer} readOnly={feedback === 'wrong'} onChange={event => onAnswer(event.target.value)} placeholder="Nhập số tiền" aria-describedby="pos-feedback" aria-invalid={feedback === 'wrong'} /><span>đồng</span></div><div className="pos-number-pad" aria-label="Bàn phím nhập tiền">{['1','2','3','4','5','6','7','8','9','000','0','backspace'].map(key => <button type="button" key={key} aria-label={key === 'backspace' ? 'Xóa chữ số cuối' : `Nhập ${key}`} onClick={() => onAnswer(key === 'backspace' ? answer.slice(0,-1) : answer + key)}>{key === 'backspace' ? <X size={21} /> : key}</button>)}</div><div id="pos-feedback" role="status" className={'pos-feedback ' + feedback}>{feedback === 'wrong' ? wrongHint : feedback === 'correct' ? 'Khớp rồi. Tiếp tục phục vụ khách nhé.' : 'Em có thể dùng bàn phím số bên dưới hoặc nhập trực tiếp.'}</div>{feedback === 'wrong' ? <button type="button" className="adventure-button retry-button" onClick={onRetry}><RotateCcw size={19} />Thử lại · {retryPrice} xu<Coins size={18} /></button> : <button type="submit" disabled={!answer.trim()} className="adventure-button">{stage === 'total' ? 'Kiểm tra hóa đơn' : 'Xác nhận tiền thừa'}<Check size={20} /></button>}<p className="pos-wallet"><Coins size={16} />Ví: {coins.toLocaleString('vi-VN')} xu · Không đủ xu vẫn có lượt hỗ trợ miễn phí.</p></form>
      </>}
    </section></div>
    {lastConsequence ? <aside className="context-warning"><CircleAlert size={22} /><div><strong>{lastConsequence.title}</strong><p>{lastConsequence.description}</p></div></aside> : null}
    <details className="work-secondary"><summary>Hàng chờ và trạng thái mô phỏng · {Math.max(0, shift.customers.length - progress.customerIndex - 1)} khách đang chờ</summary><div className="compact-customer-queue">{shift.customers.map((item,index) => <div key={item.id}><img src={gameAssets.production.customers[index % gameAssets.production.customers.length]} alt="" /><strong>{item.name}</strong><span>{index < progress.customerIndex || index === progress.customerIndex && stage === 'done' ? 'Đã phục vụ' : index === progress.customerIndex ? 'Đang tại quầy' : 'Đang chờ'}</span></div>)}</div><p>Điểm sao và các chỉ số mô phỏng chỉ được tổng kết sau khi kết thúc ca.</p></details>
    <button className="quiet-button scene-toggle" type="button" aria-expanded={sceneOpen} onClick={() => setSceneOpen(!sceneOpen)}>{sceneOpen ? 'Thu gọn không gian quầy' : 'Xem không gian quầy'}</button>
    {sceneOpen ? <Suspense fallback={<p>Đang mở không gian quầy…</p>}><WorkModeGame customers={shift.customers} customerIndex={progress.customerIndex} stage={stage} selectedChoice={selectedChoice} worldFlags={progress.worldState.flags} /></Suspense> : null}
  </section>
}

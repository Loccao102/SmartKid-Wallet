import { StallUnlockBoard } from './features/unlock/StallUnlockBoard'

export function App() {
  return (
    <main>
      <header className="hero">
        <div className="brand-row">
          <div className="brand-mark">SW</div>
          <div>
            <strong>SmartKid Wallet</strong>
            <span>Supermarket Learning Simulation</span>
          </div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">TOÁN + ĐẠO ĐỨC + RA QUYẾT ĐỊNH</p>
          <h1>Trước khi phục vụ khách, hãy khám phá siêu thị của em.</h1>
          <p>
            Mỗi gian hàng mở ra một kỹ năng mới. Khi đủ 5 gian, em sẽ bước vào ca làm việc thật với khách hàng và các tình huống bất ngờ.
          </p>
        </div>
      </header>

      <StallUnlockBoard />
    </main>
  )
}

import { StallUnlockBoard } from './features/unlock/StallUnlockBoard'

function NavIcon({ children }: { children: string }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>
}

export function App() {
  return (
    <div className="app-shell">
      <aside className="student-sidebar">
        <div className="brand-lockup">
          <div className="brand-symbol">S</div>
          <div className="brand-copy">
            <strong>SmartKid</strong>
            <span>Wallet</span>
          </div>
        </div>

        <nav className="student-nav" aria-label="Điều hướng học sinh">
          <button type="button">
            <NavIcon>⌂</NavIcon>
            <span>Trang chủ</span>
          </button>
          <button type="button" className="is-active">
            <NavIcon>▣</NavIcon>
            <span>Nhiệm vụ</span>
            <span className="nav-badge">1</span>
          </button>
          <button type="button">
            <NavIcon>★</NavIcon>
            <span>Thành tích</span>
          </button>
          <button type="button">
            <NavIcon>◔</NavIcon>
            <span>Tiến bộ</span>
          </button>
        </nav>

        <div className="sidebar-tip">
          <span className="tip-spark">✦</span>
          <strong>Mẹo nhỏ</strong>
          <p>Đọc kỹ yêu cầu trước khi tính. Một phép tính đúng chưa chắc đã là lựa chọn hợp lý nhất.</p>
        </div>

        <div className="student-mini-profile">
          <div className="avatar">M</div>
          <div>
            <strong>Minh Anh</strong>
            <span>Lớp 5A</span>
          </div>
          <button type="button" aria-label="Mở hồ sơ">⋯</button>
        </div>
      </aside>

      <div className="student-workspace">
        <header className="workspace-header">
          <div>
            <p className="page-kicker">NHIỆM VỤ CỦA EM</p>
            <h1>Chào buổi sáng, Minh Anh!</h1>
            <p>Cô Mai đã giao cho em một nhiệm vụ mới ở Siêu thị SmartMart.</p>
          </div>

          <div className="header-actions">
            <button type="button" className="icon-button notification-button" aria-label="Thông báo">
              ♢
              <span className="notification-dot" />
            </button>
            <div className="streak-pill">
              <span aria-hidden="true">🔥</span>
              <div>
                <strong>4 ngày</strong>
                <small>chuỗi học</small>
              </div>
            </div>
          </div>
        </header>

        <StallUnlockBoard />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { WorldMapScreen } from './features/world/WorldMapScreen'

type StudentPage = 'home' | 'maps' | 'missions' | 'leaderboard' | 'profile'

const navItems: Array<{ id: StudentPage; icon: string; label: string }> = [
  { id: 'home', icon: '⌂', label: 'Trang chủ' },
  { id: 'maps', icon: '▣', label: 'Bản đồ' },
  { id: 'missions', icon: '✓', label: 'Nhiệm vụ' },
  { id: 'leaderboard', icon: '★', label: 'Bảng xếp hạng' },
  { id: 'profile', icon: '●', label: 'Hồ sơ' },
]

function NavIcon({ children }: { children: string }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>
}

function PlaceholderScreen({ page }: { page: Exclude<StudentPage, 'maps'> }) {
  const content = {
    home: {
      icon: '🏠',
      title: 'Trang chủ SmartKid',
      description: 'Màn tổng quan hành trình, nhiệm vụ gần nhất và gợi ý tiếp tục sẽ được triển khai ở bước tiếp theo.',
    },
    missions: {
      icon: '🎯',
      title: 'Nhiệm vụ',
      description: 'Mission sẽ là các bài vận dụng thực tế trong thế giới SmartMart, không phải danh sách câu hỏi.',
    },
    leaderboard: {
      icon: '🏆',
      title: 'Bảng xếp hạng',
      description: 'Bảng xếp hạng sẽ ưu tiên độ chính xác, nhiệm vụ hoàn thành, chuỗi học và thử thách chuẩn hóa.',
    },
    profile: {
      icon: '👤',
      title: 'Hồ sơ của em',
      description: 'Hồ sơ sẽ hiển thị level, XP, tiến độ từng bản đồ, kỹ năng và huy hiệu.',
    },
  }[page]

  return (
    <section className="placeholder-screen">
      <span className="placeholder-icon" aria-hidden="true">{content.icon}</span>
      <p className="page-kicker">ĐANG TRIỂN KHAI</p>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
    </section>
  )
}

export function App() {
  const [page, setPage] = useState<StudentPage>('maps')

  return (
    <div className="app-shell">
      <aside className="student-sidebar">
        <div className="brand-lockup">
          <div className="brand-symbol">★</div>
          <div className="brand-copy">
            <strong>SmartKid</strong>
            <span>Wallet</span>
          </div>
        </div>

        <nav className="student-nav" aria-label="Điều hướng học sinh">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={page === item.id ? 'is-active' : ''}
              aria-label={item.label}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => setPage(item.id)}
            >
              <NavIcon>{item.icon}</NavIcon>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-tip">
          <span className="tip-spark">✦</span>
          <strong>Mẹo nhỏ</strong>
          <p>Mỗi khu vực trong SmartMart giúp em luyện một nhóm kỹ năng Toán khác nhau.</p>
        </div>

        <div className="student-mini-profile">
          <div className="avatar">M</div>
          <div>
            <strong>Minh Anh</strong>
            <span>Lớp 5A · Lv. 3</span>
          </div>
          <button type="button" aria-label="Mở hồ sơ" onClick={() => setPage('profile')}>⋯</button>
        </div>
      </aside>

      <div className="student-workspace">
        <header className="workspace-header">
          <div>
            <p className="page-kicker">SMARTKID WALLET</p>
            <h1>Chào buổi sáng, Minh Anh!</h1>
            <p>Tiếp tục hành trình tài chính của em nhé.</p>
          </div>

          <div className="header-actions">
            <div className="level-pill">
              <span aria-hidden="true">⭐</span>
              <div>
                <strong>Lv. 3</strong>
                <small>120 / 300 XP</small>
              </div>
            </div>
            <div className="streak-pill">
              <span aria-hidden="true">🔥</span>
              <div>
                <strong>7 ngày</strong>
                <small>chuỗi học</small>
              </div>
            </div>
          </div>
        </header>

        {page === 'maps' ? <WorldMapScreen /> : <PlaceholderScreen page={page} />}
      </div>
    </div>
  )
}

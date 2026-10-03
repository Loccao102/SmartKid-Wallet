import { useState } from 'react'
import { ArrowLeft, ArrowRight, Banknote, Check, CircleDollarSign, Landmark, LockKeyhole, PiggyBank, ShieldCheck, Sparkles, Target, TrendingUp } from 'lucide-react'
import { mapAssetPacks } from '../../assets/registry'
import { AvatarCharacter } from '../../components/avatar/AvatarCharacter'
import { createTinyBankMission, createTinyBankQuiz, tinyBankChapter, tinyBankLessons, type TinyBankLessonId } from '../../data/tinyBank'
import { useAvatarProfileStore } from '../../store/avatarProfile'
import { useTinyBankProgressStore } from '../../store/tinyBankProgress'
import { WorldChapterQuiz, WorldChapterStars } from '../world/WorldChapterQuiz'
import { useWorldChapterController } from '../world/useWorldChapterController'
import { BankMission } from './BankMission'

const lessonIcons = { 'saving-goal': Target, 'balance-counter': Banknote, 'growth-bonus': TrendingUp, 'four-week-mission': ShieldCheck }
const stopNames = { 'saving-goal': 'Hũ mục tiêu', 'balance-counter': 'Quầy gửi · rút', 'growth-bonus': 'Vườn phần trăm', 'four-week-mission': 'Kế hoạch 4 tuần' }

export function TinyBankScreen({ onBack }: { onBack: () => void }) {
  const avatar = useAvatarProfileStore(state => state.avatar)
  const {
    activeLessonId, setActiveLessonId, runSeed, chapterCompleted,
    completedLessonIds, bestStarsByLessonId, startLesson, finishLesson, isLessonUnlocked,
    checkpoint, saveCheckpoint, savedRunsByLessonId,
  } = useWorldChapterController({
    chapter: tinyBankChapter, lessons: tinyBankLessons, progressStore: useTinyBankProgressStore, resumeRuns: true,
  })
  const [selectedId, setSelectedId] = useState<TinyBankLessonId | null>(null)
  const nextLesson = tinyBankLessons.find(lesson => isLessonUnlocked(lesson.id) && savedRunsByLessonId[lesson.id])
    ?? tinyBankLessons.find(lesson => isLessonUnlocked(lesson.id) && !completedLessonIds.includes(lesson.id)) ?? tinyBankLessons[0]
  const selected = tinyBankLessons.find(lesson => lesson.id === selectedId) ?? nextLesson
  const selectedIndex = tinyBankLessons.indexOf(selected)
  const selectedStars = bestStarsByLessonId[selected.id] ?? 0
  const saved = savedRunsByLessonId[selected.id]

  if (activeLessonId && activeLessonId !== 'four-week-mission') {
    const lesson = tinyBankLessons.find(item => item.id === activeLessonId)!
    return <WorldChapterQuiz key={activeLessonId + ':' + runSeed} theme="bank"
      lessonTitle={lesson.title} skillLabel={lesson.skillLabel} questions={createTinyBankQuiz(activeLessonId, runSeed)} icon={CircleDollarSign}
      checkpoint={checkpoint} onCheckpoint={saveCheckpoint}
      copy={{ exitLabel: 'Về sảnh · Giữ bài đang làm', counterLabel: 'Câu', inputLabel: 'Câu trả lời của em', inputPlaceholder: 'Nhập số tiền', idleTip: 'Em có thể nháp từng bước. Bài đang làm được lưu trên thiết bị.', correctFeedback: 'Chính xác! Cùng sang bước tiếp theo nhé.', completeEyebrow: 'HOÀN THÀNH BÀI LUYỆN', completeDescription: 'Em đã mở chặng tiếp theo. Khi chơi lại, số tiền sẽ đổi để em luyện thêm.', backLabel: 'Về sảnh ngân hàng' }}
      onExit={() => setActiveLessonId(null)} onComplete={stars => finishLesson(activeLessonId, stars)} />
  }
  if (activeLessonId === 'four-week-mission') {
    return <BankMission key={'mission:' + runSeed} run={createTinyBankMission(runSeed)} checkpoint={checkpoint} onCheckpoint={saveCheckpoint}
      onExit={() => setActiveLessonId(null)} onFinish={stars => finishLesson('four-week-mission', stars)} />
  }

  return <section className="tiny-bank-screen bank-adventure" aria-labelledby="bank-title">
    <div className="bank-toolbar"><button type="button" className="quiet-button" onClick={onBack}><ArrowLeft size={18} /> Bản đồ thế giới</button>
      <span className="bank-chapter-progress">{completedLessonIds.length}/{tinyBankLessons.length} chặng hoàn thành</span></div>
    <header className="bank-arrival"><div><p className="eyebrow"><Landmark size={17} /> CHUYẾN PHIÊU LƯU THỨ HAI</p>
      <h1 id="bank-title">Ngân hàng tí hon</h1><p>Gom từng chút hôm nay, chạm ước mơ ngày mai.</p></div>
      <span><PiggyBank size={22} /> Học tiết kiệm qua 4 chặng</span></header>
    {chapterCompleted ? <div className="bank-chapter-banner" role="status"><Sparkles size={24} /><div><strong>Em đã hoàn thành Ngân hàng tí hon!</strong><span>Nhà hàng vui vẻ đang chờ em ở Cấp 8. Em vẫn có thể quay lại luyện thêm.</span></div></div> : null}
    <div className={'bank-explore-scene bank-stop-' + (selectedIndex + 1)}>
      <img className="bank-landscape" src={mapAssetPacks['tiny-bank'].scene} width="1280" height="853" alt={mapAssetPacks['tiny-bank'].description} />
      <div className="bank-traveler"><AvatarCharacter config={avatar} label="Nhân vật của em đang khám phá ngân hàng" /><span>Cùng đến {stopNames[selected.id].toLocaleLowerCase('vi-VN')}!</span></div>
      <nav className="bank-destinations" aria-label="Các điểm khám phá ngân hàng">
        {tinyBankLessons.map((lesson, index) => {
          const unlocked = isLessonUnlocked(lesson.id)
          const completed = completedLessonIds.includes(lesson.id)
          const Icon = lessonIcons[lesson.id]
          return <button key={lesson.id} type="button" className={'bank-stop bank-stop-button-' + (index + 1)}
            aria-pressed={selected.id === lesson.id}
            onClick={() => setSelectedId(lesson.id)}>
            <span className="bank-stop-icon">{completed ? <Check size={24} /> : unlocked ? <Icon size={24} /> : <LockKeyhole size={22} />}</span>
            <span><small>CHẶNG {index + 1}{savedRunsByLessonId[lesson.id] ? ' · ĐANG LÀM' : completed ? ' · ĐÃ XONG' : !unlocked ? ' · CHƯA MỞ' : ''}</small><strong>{stopNames[lesson.id]}</strong></span>
          </button>
        })}
      </nav>
    </div>
    <section className="bank-next-stop" aria-label="Chặng đã chọn" aria-live="polite">
      <div><p className="eyebrow">{saved ? 'ĐANG CHỜ EM TIẾP TỤC' : selected.skillLabel}</p><h2>{selected.id === 'four-week-mission' ? 'Kế hoạch tiết kiệm 4 tuần' : selected.title}</h2><p>{selected.description}</p>
        {selectedStars ? <WorldChapterStars value={selectedStars} /> : null}</div>
      {isLessonUnlocked(selected.id) ? <button type="button" className="adventure-button" onClick={() => { setSelectedId(null); startLesson(selected.id) }}>
        {saved ? 'Tiếp tục chặng này' : completedLessonIds.includes(selected.id) ? 'Luyện lại' : selected.id === 'four-week-mission' ? 'Mở sổ kế hoạch' : 'Bắt đầu khám phá'}<ArrowRight size={20} /></button>
        : <p className="bank-stop-requirement"><LockKeyhole size={19} />{selected.id === 'four-week-mission' ? 'Hoàn thành 3 chặng Toán để mở sổ kế hoạch.' : `Hoàn thành “${stopNames[tinyBankLessons[selectedIndex - 1].id]}” để mở chặng này.`}</p>}
    </section>
    <aside className="bank-learning-note"><ShieldCheck size={22} /><div><strong>Một nơi để thử và học</strong><p>Tiền trong bài là tiền mô phỏng, tách biệt với xu của em. Tỉ lệ phần trăm dùng để luyện Toán, không phải lãi suất ngoài đời.</p></div></aside>
  </section>
}

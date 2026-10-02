import { useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Palette,
  RotateCcw,
  Sparkles,
  UserRound,
  Shirt,
} from 'lucide-react'
import {
  accessoryOptions,
  bodyTypeOptions,
  bottomColorOptions,
  defaultStudentAvatar,
  eyeStyleOptions,
  hairColorOptions,
  hairStyleOptions,
  shoeColorOptions,
  skinToneOptions,
  topColorOptions,
  type AvatarConfig,
  type AvatarExpression,
} from '../../avatar/avatarCatalog'
import { AvatarCharacter } from '../../components/avatar/AvatarCharacter'
import { useAvatarProfileStore } from '../../store/avatarProfile'
import { Modal } from '../system/Modal'

type CustomizerTab = 'face' | 'hair' | 'outfit' | 'mood'

const tabs: Array<{ id: CustomizerTab; label: string; shortLabel: string }> = [
  { id: 'face', label: 'Khuôn mặt', shortLabel: 'Mặt' },
  { id: 'hair', label: 'Tóc & phụ kiện', shortLabel: 'Tóc' },
  { id: 'outfit', label: 'Trang phục', shortLabel: 'Đồ' },
  { id: 'mood', label: 'Biểu cảm', shortLabel: 'Biểu cảm' },
]

const expressions: Array<{ id: AvatarExpression; label: string; hint: string }> = [
  { id: 'happy', label: 'Vui vẻ', hint: 'Sẵn sàng khám phá' },
  { id: 'neutral', label: 'Bình tĩnh', hint: 'Tập trung nhẹ nhàng' },
  { id: 'thinking', label: 'Suy nghĩ', hint: 'Đang tìm cách hay' },
  { id: 'confused', label: 'Hơi bối rối', hint: 'Không sao, thử lại nhé' },
  { id: 'concerned', label: 'Quan tâm', hint: 'Luôn để ý bạn bè' },
]

const tabDescriptions: Record<CustomizerTab, string> = {
  face: 'Chọn nét gần với em nhất. Mỗi lựa chọn đều được chào đón.',
  hair: 'Kết hợp kiểu tóc và phụ kiện để tạo dấu ấn riêng.',
  outfit: 'Phối màu theo phong cách của em. Trang phục không ảnh hưởng điểm số.',
  mood: 'Thử biểu cảm (xem trước). Biểu cảm này chưa được lưu vào hồ sơ.',
}

function ColorOptions({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { id: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="avatar-option-group">
      <legend>{label}</legend>
      <div className="avatar-color-options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={value === option.id ? 'is-selected' : ''}
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            aria-label={`${label}: ${option.label}`}
            title={option.label}
          >
            <span style={{ backgroundColor: option.id }} aria-hidden="true" />
            {value === option.id ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
      <span className="avatar-selected-value">
        {options.find((option) => option.id === value)?.label ?? 'Đang chọn'}
      </span>
    </fieldset>
  )
}

function VisualOptions<T extends string>({
  label,
  value,
  options,
  draft,
  patchKey,
  onChange,
  expression,
}: {
  label: string
  value: T
  options: readonly { id: T; label: string }[]
  draft: AvatarConfig
  patchKey: keyof AvatarConfig
  onChange: (value: T) => void
  expression: AvatarExpression
}) {
  return (
    <fieldset className="avatar-option-group">
      <legend>{label}</legend>
      <div className="avatar-visual-options">
        {options.map((option) => {
          const preview = { ...draft, [patchKey]: option.id } as AvatarConfig
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              className={`avatar-visual-option ${selected ? 'is-selected' : ''}`}
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
            >
              <span className="avatar-option-art" aria-hidden="true">
                <AvatarCharacter config={preview} expression={expression} framing={patchKey === 'bodyType' || option.id === 'bag' ? 'full' : 'portrait'} decorative />
              </span>
              <span className="avatar-option-label">{option.label}</span>
              {selected ? <Check className="avatar-option-check" size={17} strokeWidth={3} aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function ExpressionOptions({ value, onChange, draft }: { value: AvatarExpression; onChange: (value: AvatarExpression) => void; draft: AvatarConfig }) {
  return (
    <div className="avatar-expression-options" role="list" aria-label="Các biểu cảm">
      {expressions.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`avatar-expression-option ${value === item.id ? 'is-selected' : ''}`}
          onClick={() => onChange(item.id)}
          aria-pressed={value === item.id}
        >
          <span className="avatar-expression-face" aria-hidden="true">
            <AvatarCharacter config={draft} expression={item.id} framing="portrait" decorative />
          </span>
          <span><strong>{item.label}</strong><small>{item.hint}</small></span>
          {value === item.id ? <Check size={17} strokeWidth={3} aria-hidden="true" /> : null}
        </button>
      ))}
    </div>
  )
}

export interface AvatarCustomizerProps {
  onClose: () => void
  /** Called after the transactional save completes, useful for first-run routing. */
  onSaved?: (avatar: AvatarConfig) => void
  initialTab?: CustomizerTab
}

export function AvatarCustomizer({ onClose, onSaved, initialTab = 'face' }: AvatarCustomizerProps) {
  const avatar = useAvatarProfileStore((state) => state.avatar)
  const hasCreatedAvatar = useAvatarProfileStore((state) => state.hasCreatedAvatar)
  const setAvatar = useAvatarProfileStore((state) => state.setAvatar)
  const markAvatarCreated = useAvatarProfileStore((state) => state.markAvatarCreated)
  const [draft, setDraft] = useState<AvatarConfig>(() => ({ ...avatar }))
  const [expression, setExpression] = useState<AvatarExpression>('happy')
  const [activeTab, setActiveTab] = useState<CustomizerTab>(initialTab)

  const patch = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const tabIndex = tabs.findIndex((tab) => tab.id === activeTab)
  const goToTab = (index: number) => setActiveTab(tabs[Math.max(0, Math.min(tabs.length - 1, index))].id)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(avatar)
  const saveStateLabel = !hasCreatedAvatar ? (isDirty ? 'Chưa lưu' : 'Chưa tạo') : isDirty ? 'Chưa lưu' : 'Đã lưu'

  const save = () => {
    setAvatar(draft)
    markAvatarCreated()
    onSaved?.(draft)
    onClose()
  }

  return (
    <Modal
      title={hasCreatedAvatar ? 'Chỉnh sửa nhân vật' : 'Tạo nhân vật của em'}
      className="avatar-customizer-modal"
      onClose={onClose}
    >
      <div className="avatar-customizer-intro">
        <div>
          <p className="avatar-kicker"><Sparkles size={15} aria-hidden="true" /> HÀNH TRANG PHIÊU LƯU</p>
          <h3>{hasCreatedAvatar ? 'Làm mới phong cách của em' : 'Nhân vật đồng hành của em'}</h3>
          <p>{hasCreatedAvatar ? 'Mọi lựa chọn vẫn là của em. Thử một diện mạo mới nhé!' : 'Tạo một người bạn đại diện cho em trên hành trình SmartMart.'}</p>
        </div>
        <span className={`avatar-save-state ${isDirty ? 'is-dirty' : ''}`} aria-live="polite">
          {saveStateLabel}
        </span>
      </div>

      <div className="avatar-customizer-layout">
        <aside className="avatar-preview-panel">
          <div className="avatar-preview-stage">
            <span className="avatar-preview-badge"><Sparkles size={14} aria-hidden="true" /> Xem trước</span>
            <div className="avatar-preview-stars" aria-hidden="true"><Sparkles size={16} /><Sparkles size={11} /><Sparkles size={13} /></div>
            <AvatarCharacter
              config={draft}
              expression={expression}
              className="avatar-preview-character"
              label="Xem trước nhân vật của em"
            />
          </div>
          <div className="avatar-preview-copy">
            <UserRound size={19} aria-hidden="true" />
            <div>
              <strong>Đây sẽ là em trong SmartKid Wallet</strong>
              <span>Nhân vật xuất hiện ở hồ sơ, bản đồ SmartMart và các nhiệm vụ.</span>
            </div>
          </div>
          <div className="avatar-current-look" aria-label="Tóm tắt diện mạo">
            <span className="avatar-current-swatch" style={{ backgroundColor: draft.topColor }} aria-hidden="true" />
            <span>Phong cách hiện tại</span>
            <strong>{draft.accessory === 'none' ? 'Gọn gàng' : 'Có phụ kiện'}</strong>
          </div>
        </aside>

        <div className="avatar-customizer-controls">
          <div className="avatar-tablist" role="tablist" aria-label="Các nhóm tùy chỉnh">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                id={`avatar-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="avatar-panel"
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => {
                  const nextIndex = event.key === 'ArrowRight'
                    ? Math.min(tabs.length - 1, index + 1)
                    : event.key === 'ArrowLeft'
                      ? Math.max(0, index - 1)
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? tabs.length - 1
                          : index
                  if (nextIndex !== index) {
                    event.preventDefault()
                    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[nextIndex]?.focus()
                    goToTab(nextIndex)
                  }
                }}
              >
                <span className="avatar-tab-number">{index + 1}</span>
                <span><strong>{tab.label}</strong><small>{tab.shortLabel}</small></span>
              </button>
            ))}
          </div>

          <section id="avatar-panel" className="avatar-control-section avatar-active-panel" role="tabpanel" aria-labelledby={`avatar-tab-${activeTab}`}>
            <header>
              {activeTab === 'face' ? <UserRound size={20} aria-hidden="true" /> : activeTab === 'hair' ? <Sparkles size={20} aria-hidden="true" /> : activeTab === 'outfit' ? <Shirt size={20} aria-hidden="true" /> : <Palette size={20} aria-hidden="true" />}
              <div><strong>{tabs.find((tab) => tab.id === activeTab)?.label}</strong><span>{tabDescriptions[activeTab]}</span></div>
            </header>

            {activeTab === 'face' ? <>
              <VisualOptions label="Dáng người" value={draft.bodyType} options={bodyTypeOptions} draft={draft} patchKey="bodyType" expression={expression} onChange={(value) => patch('bodyType', value)} />
              <ColorOptions label="Màu da" value={draft.skinTone} options={skinToneOptions} onChange={(value) => patch('skinTone', value)} />
              <VisualOptions label="Kiểu mắt" value={draft.eyeStyle} options={eyeStyleOptions} draft={draft} patchKey="eyeStyle" expression={expression} onChange={(value) => patch('eyeStyle', value)} />
            </> : null}

            {activeTab === 'hair' ? <>
              <VisualOptions label="Kiểu tóc" value={draft.hairStyle} options={hairStyleOptions} draft={draft} patchKey="hairStyle" expression={expression} onChange={(value) => patch('hairStyle', value)} />
              <ColorOptions label="Màu tóc" value={draft.hairColor} options={hairColorOptions} onChange={(value) => patch('hairColor', value)} />
              <VisualOptions label="Phụ kiện" value={draft.accessory} options={accessoryOptions} draft={draft} patchKey="accessory" expression={expression} onChange={(value) => patch('accessory', value)} />
            </> : null}

            {activeTab === 'outfit' ? <>
              <ColorOptions label="Màu áo" value={draft.topColor} options={topColorOptions} onChange={(value) => patch('topColor', value)} />
              <ColorOptions label="Màu quần" value={draft.bottomColor} options={bottomColorOptions} onChange={(value) => patch('bottomColor', value)} />
              <ColorOptions label="Màu giày" value={draft.shoeColor} options={shoeColorOptions} onChange={(value) => patch('shoeColor', value)} />
            </> : null}

            {activeTab === 'mood' ? <ExpressionOptions value={expression} onChange={setExpression} draft={draft} /> : null}
          </section>

          <div className="avatar-step-controls">
            <button type="button" className="quiet-button" onClick={() => goToTab(tabIndex - 1)} disabled={tabIndex === 0}>
              <ChevronLeft size={18} aria-hidden="true" /> Quay lại
            </button>
            <span aria-live="polite">Bước {tabIndex + 1} / {tabs.length}</span>
            <button type="button" className="quiet-button" onClick={() => goToTab(tabIndex + 1)} disabled={tabIndex === tabs.length - 1}>
              Tiếp theo <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="avatar-customizer-actions">
        <button type="button" className="outline-button" onClick={() => setDraft({ ...defaultStudentAvatar })}>
          <RotateCcw size={18} aria-hidden="true" /> Về mẫu ban đầu
        </button>
        <div>
          <button type="button" className="quiet-button avatar-cancel-button" onClick={onClose}>Hủy</button>
          <button type="button" className="adventure-button" onClick={save}>
            <Check size={19} strokeWidth={3} aria-hidden="true" /> Lưu nhân vật
          </button>
        </div>
      </div>
    </Modal>
  )
}

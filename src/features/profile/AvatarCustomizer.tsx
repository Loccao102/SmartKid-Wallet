import { useState } from 'react'
import { Check, Palette, RotateCcw, Sparkles, User } from 'lucide-react'
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

const expressions: Array<{ id: AvatarExpression; label: string }> = [
  { id: 'happy', label: 'Vui' },
  { id: 'neutral', label: 'Bình thường' },
  { id: 'thinking', label: 'Suy nghĩ' },
  { id: 'confused', label: 'Bối rối' },
  { id: 'concerned', label: 'Lo lắng' },
]

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
            aria-label={option.label}
            title={option.label}
          >
            <span style={{ backgroundColor: option.id }} aria-hidden="true" />
            {value === option.id ? <Check size={15} aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function TextOptions<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { id: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="avatar-option-group">
      <legend>{label}</legend>
      <div className="avatar-text-options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={value === option.id ? 'is-selected' : ''}
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
          >
            {option.label}
            {value === option.id ? <Check size={15} aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function AvatarCustomizer({ onClose }: { onClose: () => void }) {
  const avatar = useAvatarProfileStore((state) => state.avatar)
  const setAvatar = useAvatarProfileStore((state) => state.setAvatar)
  const [draft, setDraft] = useState<AvatarConfig>(() => ({ ...avatar }))
  const [expression, setExpression] = useState<AvatarExpression>('happy')

  const patch = <K extends keyof AvatarConfig>(
    key: K,
    value: AvatarConfig[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const save = () => {
    setAvatar(draft)
    onClose()
  }

  return (
    <Modal
      title="Tạo nhân vật của em"
      className="avatar-customizer-modal"
      onClose={onClose}
    >
      <div className="avatar-customizer-layout">
        <aside className="avatar-preview-panel">
          <div className="avatar-preview-stage">
            <AvatarCharacter
              config={draft}
              expression={expression}
              className="avatar-preview-character"
              label="Xem trước nhân vật của em"
            />
          </div>
          <div className="avatar-preview-copy">
            <Sparkles size={19} aria-hidden="true" />
            <div>
              <strong>Đây sẽ là em trong SmartKid Wallet</strong>
              <span>Nhân vật xuất hiện ở hồ sơ, thanh trên cùng và các ca làm.</span>
            </div>
          </div>
          <div className="avatar-expression-strip" aria-label="Xem thử biểu cảm">
            {expressions.map((item) => (
              <button
                key={item.id}
                type="button"
                className={expression === item.id ? 'is-selected' : ''}
                onClick={() => setExpression(item.id)}
                aria-pressed={expression === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="avatar-customizer-controls">
          <section className="avatar-control-section">
            <header>
              <User size={19} aria-hidden="true" />
              <div>
                <strong>Dáng người & khuôn mặt</strong>
                <span>Chọn hình dáng em thấy gần gũi nhất.</span>
              </div>
            </header>
            <TextOptions
              label="Dáng người"
              value={draft.bodyType}
              options={bodyTypeOptions}
              onChange={(value) => patch('bodyType', value)}
            />
            <ColorOptions
              label="Màu da"
              value={draft.skinTone}
              options={skinToneOptions}
              onChange={(value) => patch('skinTone', value)}
            />
            <TextOptions
              label="Kiểu mắt"
              value={draft.eyeStyle}
              options={eyeStyleOptions}
              onChange={(value) => patch('eyeStyle', value)}
            />
          </section>

          <section className="avatar-control-section">
            <header>
              <Sparkles size={19} aria-hidden="true" />
              <div>
                <strong>Tóc</strong>
                <span>Phối kiểu và màu tóc theo ý em.</span>
              </div>
            </header>
            <TextOptions
              label="Kiểu tóc"
              value={draft.hairStyle}
              options={hairStyleOptions}
              onChange={(value) => patch('hairStyle', value)}
            />
            <ColorOptions
              label="Màu tóc"
              value={draft.hairColor}
              options={hairColorOptions}
              onChange={(value) => patch('hairColor', value)}
            />
          </section>

          <section className="avatar-control-section">
            <header>
              <Palette size={19} aria-hidden="true" />
              <div>
                <strong>Trang phục</strong>
                <span>Màu sắc chỉ để thể hiện cá tính, không ảnh hưởng điểm số.</span>
              </div>
            </header>
            <ColorOptions
              label="Áo"
              value={draft.topColor}
              options={topColorOptions}
              onChange={(value) => patch('topColor', value)}
            />
            <ColorOptions
              label="Quần / váy"
              value={draft.bottomColor}
              options={bottomColorOptions}
              onChange={(value) => patch('bottomColor', value)}
            />
            <ColorOptions
              label="Giày"
              value={draft.shoeColor}
              options={shoeColorOptions}
              onChange={(value) => patch('shoeColor', value)}
            />
            <TextOptions
              label="Phụ kiện"
              value={draft.accessory}
              options={accessoryOptions}
              onChange={(value) => patch('accessory', value)}
            />
          </section>
        </div>
      </div>

      <div className="avatar-customizer-actions">
        <button
          type="button"
          className="outline-button"
          onClick={() => setDraft({ ...defaultStudentAvatar })}
        >
          <RotateCcw size={18} aria-hidden="true" />
          Về mẫu ban đầu
        </button>
        <button type="button" className="adventure-button" onClick={save}>
          <Check size={19} aria-hidden="true" />
          Lưu nhân vật
        </button>
      </div>
    </Modal>
  )
}

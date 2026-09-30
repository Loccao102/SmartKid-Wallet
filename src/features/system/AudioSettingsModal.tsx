import { Volume2, VolumeX } from 'lucide-react'
import { useAudioSettingsStore } from '../../store/audioSettings'
import { Modal } from './Modal'

function VolumeRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="audio-volume-row">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(value * 100)}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
      />
      <strong>{Math.round(value * 100)}%</strong>
    </label>
  )
}

export function AudioSettingsModal({ onClose }: { onClose: () => void }) {
  const state = useAudioSettingsStore()

  return (
    <Modal title="Âm thanh" onClose={onClose} className="audio-settings-modal">
      <div className="audio-master-toggle">
        {state.muted ? <VolumeX size={26} /> : <Volume2 size={26} />}
        <div>
          <strong>Âm thanh trò chơi</strong>
          <span>Nhạc chill nhẹ, không khí và hiệu ứng.</span>
        </div>
        <button
          type="button"
          className="outline-button"
          onClick={() => state.setMuted(!state.muted)}
        >
          {state.muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        </button>
      </div>

      <VolumeRow
        label="Âm lượng tổng"
        value={state.masterVolume}
        onChange={state.setMasterVolume}
      />

      <div className="audio-toggle-row">
        <label>
          <input
            type="checkbox"
            checked={state.musicEnabled}
            onChange={(event) => state.setMusicEnabled(event.target.checked)}
          />
          Nhạc nền
        </label>
        <VolumeRow
          label="Mức nhạc"
          value={state.musicVolume}
          onChange={state.setMusicVolume}
        />
      </div>

      <div className="audio-toggle-row">
        <label>
          <input
            type="checkbox"
            checked={state.ambientEnabled}
            onChange={(event) => state.setAmbientEnabled(event.target.checked)}
          />
          Không khí
        </label>
        <VolumeRow
          label="Mức không khí"
          value={state.ambientVolume}
          onChange={state.setAmbientVolume}
        />
      </div>

      <div className="audio-toggle-row">
        <label>
          <input
            type="checkbox"
            checked={state.sfxEnabled}
            onChange={(event) => state.setSfxEnabled(event.target.checked)}
          />
          Hiệu ứng
        </label>
        <VolumeRow
          label="Mức hiệu ứng"
          value={state.sfxVolume}
          onChange={state.setSfxVolume}
        />
      </div>
    </Modal>
  )
}

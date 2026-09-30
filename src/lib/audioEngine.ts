export type GameSfx =
  | 'click'
  | 'correct'
  | 'retry'
  | 'coin'
  | 'xp'
  | 'unlock'
  | 'level-up'
  | 'mission-complete'
  | 'scan'
  | 'consequence'

interface MixSettings {
  muted: boolean
  musicEnabled: boolean
  ambientEnabled: boolean
  sfxEnabled: boolean
  masterVolume: number
  musicVolume: number
  ambientVolume: number
  sfxVolume: number
}

class SmartKidAudioEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private music: GainNode | null = null
  private ambient: GainNode | null = null
  private sfx: GainNode | null = null
  private ambientSource: AudioBufferSourceNode | null = null
  private musicTimer: number | null = null
  private mix: MixSettings = {
    muted: false,
    musicEnabled: true,
    ambientEnabled: true,
    sfxEnabled: true,
    masterVolume: 0.7,
    musicVolume: 0.4,
    ambientVolume: 0.3,
    sfxVolume: 0.75,
  }

  async start() {
    if (typeof window === 'undefined') return
    if (!this.context) this.createGraph()
    if (this.context?.state === 'suspended') await this.context.resume()
    this.applyMix()
    this.ensureMusicLoop()
    this.ensureAmbient()
  }

  setMix(mix: MixSettings) {
    this.mix = mix
    this.applyMix()
  }

  play(type: GameSfx) {
    if (!this.context || !this.sfx || this.mix.muted || !this.mix.sfxEnabled) return

    const presets: Record<GameSfx, [number, number, number][]> = {
      click: [[520, 0, 0.05]],
      correct: [[660, 0, 0.08], [880, 0.09, 0.12]],
      retry: [[330, 0, 0.09], [294, 0.09, 0.12]],
      coin: [[880, 0, 0.06], [1180, 0.06, 0.09]],
      xp: [[600, 0, 0.07], [760, 0.07, 0.08]],
      unlock: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.16]],
      'level-up': [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1046, 0.28, 0.22]],
      'mission-complete': [[587, 0, 0.1], [740, 0.11, 0.1], [880, 0.22, 0.18]],
      scan: [[960, 0, 0.05]],
      consequence: [[392, 0, 0.09], [349, 0.1, 0.12]],
    }

    for (const [frequency, delay, duration] of presets[type]) {
      this.tone(frequency, delay, duration, this.sfx, 'sine', 0.11)
    }
  }

  private createGraph() {
    this.context = new AudioContext()
    this.master = this.context.createGain()
    this.music = this.context.createGain()
    this.ambient = this.context.createGain()
    this.sfx = this.context.createGain()

    this.music.connect(this.master)
    this.ambient.connect(this.master)
    this.sfx.connect(this.master)
    this.master.connect(this.context.destination)
  }

  private applyMix() {
    if (!this.context || !this.master || !this.music || !this.ambient || !this.sfx) return
    const now = this.context.currentTime
    const smooth = (node: GainNode, value: number) =>
      node.gain.setTargetAtTime(value, now, 0.03)

    smooth(this.master, this.mix.muted ? 0 : this.mix.masterVolume)
    smooth(this.music, this.mix.musicEnabled ? this.mix.musicVolume * 0.12 : 0)
    smooth(this.ambient, this.mix.ambientEnabled ? this.mix.ambientVolume * 0.08 : 0)
    smooth(this.sfx, this.mix.sfxEnabled ? this.mix.sfxVolume : 0)
  }

  private ensureMusicLoop() {
    if (!this.context || !this.music || this.musicTimer !== null) return

    const playPhrase = () => {
      if (!this.context || !this.music) return
      const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23]
      notes.forEach((frequency, index) => {
        this.tone(frequency, index * 0.55, 0.48, this.music!, 'sine', 0.22)
      })
    }

    playPhrase()
    this.musicTimer = window.setInterval(playPhrase, 4600)
  }

  private ensureAmbient() {
    if (!this.context || !this.ambient || this.ambientSource) return

    const seconds = 2
    const buffer = this.context.createBuffer(
      1,
      this.context.sampleRate * seconds,
      this.context.sampleRate,
    )
    const channel = buffer.getChannelData(0)

    for (let i = 0; i < channel.length; i += 1) {
      channel[i] = (Math.random() * 2 - 1) * 0.16
    }

    const source = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 650
    source.buffer = buffer
    source.loop = true
    source.connect(filter)
    filter.connect(this.ambient)
    source.start()
    this.ambientSource = source
  }

  private tone(
    frequency: number,
    delay: number,
    duration: number,
    target: AudioNode,
    type: OscillatorType,
    gainValue: number,
  ) {
    if (!this.context) return

    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    const start = this.context.currentTime + delay
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(target)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.03)
  }
}

export const smartKidAudio = new SmartKidAudioEngine()

export function playGameSfx(type: GameSfx) {
  smartKidAudio.play(type)
}

let context: AudioContext | null = null
let muted = false

export function setGameMuted(value: boolean) {
  muted = value
}

export function isGameMuted() {
  return muted
}

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const Ctx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!context) context = new Ctx()
  if (context.state === "suspended") void context.resume()
  return context
}

function tone(frequency: number, duration: number, type: OscillatorType, gain: number) {
  if (muted) return
  const ctx = audioContext()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const amp = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.45), ctx.currentTime + duration)
  amp.gain.setValueAtTime(gain, ctx.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  oscillator.connect(amp)
  amp.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + duration + 0.02)
}

export function playPop() {
  tone(540, 0.12, "sine", 0.06)
}

export function playTick() {
  tone(660, 0.07, "sine", 0.04)
}

export function playMiss() {
  tone(180, 0.1, "triangle", 0.04)
}

export function playClear() {
  tone(520, 0.08, "sine", 0.05)
  window.setTimeout(() => tone(780, 0.14, "sine", 0.04), 90)
}

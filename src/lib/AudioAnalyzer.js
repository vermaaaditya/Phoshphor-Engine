function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function averageRange(data, start, end) {
  if (!data || end <= start) {
    return 0
  }

  let sum = 0
  for (let i = start; i < end; i += 1) {
    sum += data[i]
  }

  return (sum / (end - start)) / 255
}

export default class AudioAnalyzer {
  constructor({ fftSize = 1024, smoothing = 0.82 } = {}) {
    this.fftSize = fftSize
    this.smoothing = smoothing
    this.active = false
    this.failed = false
    this.audioContext = null
    this.stream = null
    this.source = null
    this.analyser = null
    this.frequencyData = null
    this.smoothedLevel = 0
    this.previousLevel = 0
    this.syntheticSeed = Math.random() * 1000
  }

  async start() {
    if (this.active || this.failed || typeof window === 'undefined') {
      return
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const hasMediaDevices = typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia

    if (!AudioCtx || !hasMediaDevices) {
      this.failed = true
      return
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      })
      this.audioContext = new AudioCtx()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = this.fftSize
      this.analyser.smoothingTimeConstant = this.smoothing
      this.source = this.audioContext.createMediaStreamSource(this.stream)
      this.source.connect(this.analyser)
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
      this.active = true
    } catch {
      this.failed = true
      this.stop()
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect()
      this.source = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }

    this.analyser = null
    this.frequencyData = null
    this.active = false
  }

  getMetrics(time = performance.now()) {
    let bass = 0
    let mid = 0
    let treble = 0
    let level = 0

    if (this.active && this.analyser && this.frequencyData) {
      this.analyser.getByteFrequencyData(this.frequencyData)
      const bins = this.frequencyData.length
      const bassEnd = Math.floor(bins * 0.1)
      const midEnd = Math.floor(bins * 0.45)
      bass = averageRange(this.frequencyData, 0, bassEnd)
      mid = averageRange(this.frequencyData, bassEnd, midEnd)
      treble = averageRange(this.frequencyData, midEnd, bins)
      level = bass * 0.45 + mid * 0.35 + treble * 0.2
    } else {
      const t = time * 0.0018 + this.syntheticSeed
      bass = 0.35 + Math.sin(t * 0.63) * 0.25
      mid = 0.3 + Math.sin(t * 1.1 + 1.3) * 0.2
      treble = 0.22 + Math.sin(t * 1.8 + 2.4) * 0.15
      level = clamp((bass * 0.5 + mid * 0.35 + treble * 0.15) * 0.7, 0, 1)
    }

    this.smoothedLevel += (level - this.smoothedLevel) * 0.24
    const pulse = clamp((this.smoothedLevel - this.previousLevel) * 8 + this.smoothedLevel * 0.55, 0, 1)
    this.previousLevel = this.smoothedLevel

    return {
      active: this.active,
      level: clamp(this.smoothedLevel, 0, 1),
      pulse,
      bass: clamp(bass, 0, 1),
      mid: clamp(mid, 0, 1),
      treble: clamp(treble, 0, 1),
    }
  }
}

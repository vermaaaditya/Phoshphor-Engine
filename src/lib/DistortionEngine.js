const PRESETS = {
  Default: { radial: 0.58, tangent: 0.08, wave: 0.12, jitter: 0.03, shift: 0.1 },
  Ripple: { radial: 0.28, tangent: 0.2, wave: 0.34, jitter: 0.02, shift: 0.16 },
  'Glitch-lite': { radial: 0.16, tangent: 0.38, wave: 0.06, jitter: 0.22, shift: 0.24 },
}

function smoothFalloff(distance, radius) {
  const t = Math.max(0, 1 - distance / radius)
  return t * t * (3 - 2 * t)
}

export default class DistortionEngine {
  constructor(size = 0) {
    this.cols = 0
    this.rows = 0
    this.size = 0
    this.pointer = { active: false, col: -1, row: -1 }
    this.x = new Float32Array(0)
    this.y = new Float32Array(0)
    this.shift = new Float32Array(0)
    this.vx = new Float32Array(0)
    this.vy = new Float32Array(0)
    this.vShift = new Float32Array(0)

    if (size > 0) {
      this.#allocate(size)
    }
  }

  #allocate(size) {
    this.size = size
    this.x = new Float32Array(size)
    this.y = new Float32Array(size)
    this.shift = new Float32Array(size)
    this.vx = new Float32Array(size)
    this.vy = new Float32Array(size)
    this.vShift = new Float32Array(size)
  }

  resize(cols, rows) {
    const size = Math.max(0, cols * rows)
    this.cols = cols
    this.rows = rows
    if (size !== this.size) {
      this.#allocate(size)
    }
  }

  setPointer(col, row) {
    this.pointer.active = true
    this.pointer.col = col
    this.pointer.row = row
  }

  clearPointer() {
    this.pointer.active = false
    this.pointer.col = -1
    this.pointer.row = -1
  }

  update({ time = 0, delta = 16.67, strength = 0.5, preset = 'Default', audioLevel = 0, audioPulse = 0 }) {
    if (!this.size) {
      return
    }

    const profile = PRESETS[preset] ?? PRESETS.Default
    const dt = Math.min(2, Math.max(0.5, delta / 16.67))
    const damping = Math.min(0.975, Math.max(0.75, 0.84 + audioLevel * 0.08))
    const spring = 0.1 * dt
    const shiftSpring = 0.08 * dt

    for (let i = 0; i < this.size; i += 1) {
      this.vx[i] = (this.vx[i] - this.x[i] * spring) * damping
      this.vy[i] = (this.vy[i] - this.y[i] * spring) * damping
      this.vShift[i] = (this.vShift[i] - this.shift[i] * shiftSpring) * damping

      this.x[i] += this.vx[i]
      this.y[i] += this.vy[i]
      this.shift[i] += this.vShift[i]
    }

    if (!this.pointer.active || strength <= 0) {
      return
    }

    const radius = Math.max(2.5, Math.min(this.cols, this.rows) * (0.1 + audioLevel * 0.08))
    const minX = Math.max(0, Math.floor(this.pointer.col - radius))
    const maxX = Math.min(this.cols - 1, Math.ceil(this.pointer.col + radius))
    const minY = Math.max(0, Math.floor(this.pointer.row - radius))
    const maxY = Math.min(this.rows - 1, Math.ceil(this.pointer.row + radius))
    const impulseScale = strength * (0.55 + audioPulse * 0.45)

    for (let row = minY; row <= maxY; row += 1) {
      const rowBand = Math.sin(time * 0.018 + row * 0.92)
      for (let col = minX; col <= maxX; col += 1) {
        const dx = col - this.pointer.col
        const dy = row - this.pointer.row
        const distance = Math.hypot(dx, dy)

        if (distance > radius) {
          continue
        }

        const index = row * this.cols + col
        const influence = smoothFalloff(distance, radius) * impulseScale
        const invDistance = 1 / Math.max(distance, 0.0001)
        const nx = dx * invDistance
        const ny = dy * invDistance
        const tx = -ny
        const ty = nx
        const wave = Math.sin(distance * 1.35 - time * 0.014)
        const jitter = Math.sin(time * 0.031 + index * 0.23)

        this.vx[index] += (nx * (profile.radial + wave * profile.wave) + tx * (profile.tangent * jitter)) * influence
        this.vy[index] += (ny * (profile.radial + wave * profile.wave) + ty * (profile.tangent * jitter)) * influence
        this.vShift[index] += (wave * profile.shift + jitter * profile.jitter + rowBand * profile.jitter * 0.45) * influence
      }
    }
  }
}

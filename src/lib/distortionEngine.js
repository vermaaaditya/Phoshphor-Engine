export function createDistortionState(size) {
  return {
    x: new Float32Array(size),
    y: new Float32Array(size),
    shift: new Float32Array(size),
    velocityX: new Float32Array(size),
    velocityY: new Float32Array(size),
    velocityShift: new Float32Array(size),
  }
}

export function resizeDistortionState(state, size) {
  if (state.x.length === size) {
    return state
  }
  return createDistortionState(size)
}

function falloff(distance, radius) {
  const normalized = Math.max(0, 1 - distance / radius)
  return normalized * normalized * (3 - 2 * normalized)
}

function applySpringStep(state, recovery) {
  const spring = 0.1
  const shiftSpring = 0.08

  for (let i = 0; i < state.x.length; i += 1) {
    state.velocityX[i] = (state.velocityX[i] - state.x[i] * spring) * recovery
    state.velocityY[i] = (state.velocityY[i] - state.y[i] * spring) * recovery
    state.velocityShift[i] = (state.velocityShift[i] - state.shift[i] * shiftSpring) * recovery

    state.x[i] += state.velocityX[i]
    state.y[i] += state.velocityY[i]
    state.shift[i] += state.velocityShift[i]
  }
}

export function updateDistortionField({
  state,
  cols,
  rows,
  cursor,
  settings,
  preset,
  time,
}) {
  const recovery = Math.max(0.6, Math.min(0.99, settings.recovery))
  applySpringStep(state, recovery)

  if (!cursor.active || cursor.col < 0 || cursor.row < 0) {
    return
  }

  const minX = Math.max(0, Math.floor(cursor.col - settings.radius))
  const maxX = Math.min(cols - 1, Math.ceil(cursor.col + settings.radius))
  const minY = Math.max(0, Math.floor(cursor.row - settings.radius))
  const maxY = Math.min(rows - 1, Math.ceil(cursor.row + settings.radius))

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - cursor.col
      const dy = y - cursor.row
      const distance = Math.hypot(dx, dy)

      if (distance > settings.radius) {
        continue
      }

      const index = y * cols + x
      const influence = falloff(distance, settings.radius) * settings.strength
      const safeDistance = Math.max(distance, 0.0001)
      const directionX = distance < 0.0001 ? Math.cos(time * 0.01) : dx / safeDistance
      const directionY = distance < 0.0001 ? Math.sin(time * 0.01) : dy / safeDistance

      if (preset === 'Ripple') {
        const wave = Math.sin(distance * 1.35 - time * 0.014)
        const rippleForce = wave * influence * 0.38

        state.velocityX[index] += directionX * rippleForce * 0.4
        state.velocityY[index] += directionY * rippleForce * 0.7
        state.velocityShift[index] += wave * influence * 0.14
      } else if (preset === 'Glitch-lite') {
        const rowBand = Math.sin(time * 0.03 + y * 2.6)
        const jitter = Math.sin(time * 0.08 + index * 0.37)

        if (rowBand > 0.55) {
          state.velocityX[index] += Math.sign(rowBand) * influence * 0.9
        }
        state.velocityY[index] += jitter * influence * 0.05
        state.velocityShift[index] += jitter * influence * 0.24
      } else {
        state.velocityX[index] += directionX * influence * 0.48
        state.velocityY[index] += directionY * influence * 0.48
        state.velocityShift[index] += influence * 0.08
      }
    }
  }
}

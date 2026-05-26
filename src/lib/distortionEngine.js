export function createDistortionState(size) {
  return {
    x: new Float32Array(size),
    y: new Float32Array(size),
    shift: new Float32Array(size),
  }
}

export function resizeDistortionState(state, size) {
  if (state.x.length === size) {
    return state
  }
  return createDistortionState(size)
}

function falloff(distance, radius) {
  return Math.max(0, 1 - distance / radius) ** 2
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
  for (let i = 0; i < state.x.length; i += 1) {
    state.x[i] *= recovery
    state.y[i] *= recovery
    state.shift[i] *= recovery
  }

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
      const angle = Math.atan2(dy, dx)

      if (preset === 'Ripple') {
        state.x[index] += Math.cos(angle) * influence * 0.3
        state.y[index] += Math.sin(angle) * influence * 0.3
        state.shift[index] += Math.sin(time * 0.01 + distance * 0.8) * influence * 0.1
      } else if (preset === 'Glitch-lite') {
        state.x[index] += ((Math.sin(time * 0.05 + index) > 0 ? 1 : -1) * influence) / 2
        state.y[index] += Math.cos(time * 0.03 + x) * influence * 0.06
        state.shift[index] += Math.sin(time * 0.08 + index) * influence * 0.4
      } else {
        state.x[index] += Math.cos(angle) * influence * 0.22
        state.y[index] += Math.sin(angle) * influence * 0.18
        state.shift[index] += influence * 0.16
      }
    }
  }
}

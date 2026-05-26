export const RAMP_PRESETS = {
  Classic: '@%#*+=-:. ',
  Dense: '█▓▒░ .',
  Blocks: 'MWN$@B%8&#+=;:,.- ',
}

export function mapLuminanceToIndices(luminance, ramp) {
  const maxIndex = Math.max(ramp.length - 1, 1)
  const mapped = new Uint16Array(luminance.length)

  for (let i = 0; i < luminance.length; i += 1) {
    mapped[i] = Math.round((luminance[i] / 255) * maxIndex)
  }

  return mapped
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function indicesToFrame(indices, cols, rows, ramp, shiftField) {
  const lines = new Array(rows)
  for (let y = 0; y < rows; y += 1) {
    let line = ''
    for (let x = 0; x < cols; x += 1) {
      const index = y * cols + x
      const shiftedIndex = clamp(
        Math.round(indices[index] + (shiftField?.[index] ?? 0)),
        0,
        ramp.length - 1,
      )
      line += ramp[shiftedIndex]
    }
    lines[y] = line
  }

  return lines
}

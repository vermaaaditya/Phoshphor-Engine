function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function adjustLuminance(value, brightness, contrast, invert) {
  const normalized = value / 255
  const contrasted = (normalized - 0.5) * (1 + contrast / 100) + 0.5
  const brightened = contrasted + brightness / 100
  const clamped = clamp(brightened, 0, 1)
  const output = invert ? 1 - clamped : clamped
  return output * 255
}

export function processImageToLuminance(image, cols, rows, settings, canvas, context) {
  canvas.width = cols
  canvas.height = rows
  context.clearRect(0, 0, cols, rows)
  context.drawImage(image, 0, 0, cols, rows)

  const imageData = context.getImageData(0, 0, cols, rows)
  const { data } = imageData
  const luminance = new Float32Array(cols * rows)

  for (let i = 0, pixelIndex = 0; i < data.length; i += 4, pixelIndex += 1) {
    const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    luminance[pixelIndex] = adjustLuminance(
      luma,
      settings.brightness,
      settings.contrast,
      settings.invert,
    )
  }

  return luminance
}

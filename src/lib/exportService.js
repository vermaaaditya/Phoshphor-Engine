function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function exportCanvas(canvas, type) {
  const mime = type === 'jpeg' ? 'image/jpeg' : 'image/png'
  canvas.toBlob((blob) => {
    if (!blob) {
      return
    }
    downloadBlob(blob, `ascii-output.${type}`)
  }, mime)
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function exportSvg({ lines, offsetsX, offsetsY, cols, rows, cellWidth, cellHeight, fontSize }) {
  const width = cols * cellWidth
  const height = rows * cellHeight
  const content = lines
    .map((line, row) => {
      const chars = line
        .split('')
        .map((char, col) => {
          const index = row * cols + col
          const x = col * cellWidth + (offsetsX[index] ?? 0)
          const y = row * cellHeight + (offsetsY[index] ?? 0)
          return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}">${escapeXml(char)}</text>`
        })
        .join('')
      return `<g transform="translate(0, ${fontSize})">${chars}</g>`
    })
    .join('')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#050505" />
  <g fill="#f5f5f5" font-family="'IBM Plex Mono', monospace" font-size="${fontSize}" letter-spacing="0">
    ${content}
  </g>
</svg>`

  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'ascii-output.svg')
}

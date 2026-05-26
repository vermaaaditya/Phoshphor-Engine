import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import BackgroundScene from './components/BackgroundScene.jsx'
import { RAMP_PRESETS, indicesToFrame, mapLuminanceToIndices } from './lib/asciiMapper.js'
import {
  createDistortionState,
  resizeDistortionState,
  updateDistortionField,
} from './lib/distortionEngine.js'
import { exportCanvas, exportSvg } from './lib/exportService.js'
import { processImageToLuminance } from './lib/imageProcessor.js'

const DISTORTION_PRESETS = ['Warp', 'Ripple', 'Glitch-lite']
const DEFAULT_SETTINGS = {
  columns: 120,
  brightness: 0,
  contrast: 0,
  invert: false,
  ramp: RAMP_PRESETS.Classic,
  radius: 10,
  strength: 2.1,
  recovery: 0.9,
  distortionPreset: DISTORTION_PRESETS[0],
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [status, setStatus] = useState('Upload an image to begin.')
  const [imageMeta, setImageMeta] = useState(null)
  const [cursor, setCursor] = useState({ active: false, col: -1, row: -1, x: 0, y: 0 })
  const sampleSurface = useMemo(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })
    return { canvas, context }
  }, [])

  const outputCanvasRef = useRef(null)
  const imageRef = useRef(null)
  const frameRef = useRef({
    cols: 0,
    rows: 0,
    lines: [],
    offsetsX: new Float32Array(0),
    offsetsY: new Float32Array(0),
    cellWidth: 0,
    cellHeight: 0,
    fontSize: 0,
  })
  const baseIndicesRef = useRef(new Uint16Array(0))
  const distortionRef = useRef(createDistortionState(0))

  const rampPresets = useMemo(() => Object.entries(RAMP_PRESETS), [])

  useEffect(() => {
    let animationFrame = 0

    const renderFrame = (time) => {
      const canvas = outputCanvasRef.current
      const image = imageRef.current
      if (!canvas || !image || !sampleSurface.context) {
        animationFrame = requestAnimationFrame(renderFrame)
        return
      }

      const cols = settings.columns
      const rows = Math.max(1, Math.round((image.height / image.width) * cols * 0.56))
      const fontSize = clamp(900 / cols, 6, 14)
      const cellWidth = fontSize * 0.64
      const cellHeight = fontSize * 1.12

      const ctx = canvas.getContext('2d')
      canvas.width = Math.floor(cols * cellWidth)
      canvas.height = Math.floor(rows * cellHeight)
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#f5f5f5'
      ctx.font = `${fontSize}px "IBM Plex Mono", monospace`
      ctx.textBaseline = 'top'

      const luminance = processImageToLuminance(
        image,
        cols,
        rows,
        settings,
        sampleSurface.canvas,
        sampleSurface.context,
      )
      baseIndicesRef.current = mapLuminanceToIndices(luminance, settings.ramp)

      distortionRef.current = resizeDistortionState(distortionRef.current, rows * cols)
      updateDistortionField({
        state: distortionRef.current,
        cols,
        rows,
        cursor,
        settings,
        preset: settings.distortionPreset,
        time,
      })

      const lines = indicesToFrame(
        baseIndicesRef.current,
        cols,
        rows,
        settings.ramp,
        distortionRef.current.shift,
      )

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const index = y * cols + x
          const drawX = x * cellWidth + distortionRef.current.x[index]
          const drawY = y * cellHeight + distortionRef.current.y[index]
          ctx.fillText(lines[y][x], drawX, drawY)
        }
      }

      frameRef.current = {
        cols,
        rows,
        lines,
        offsetsX: distortionRef.current.x,
        offsetsY: distortionRef.current.y,
        cellWidth,
        cellHeight,
        fontSize,
      }

      animationFrame = requestAnimationFrame(renderFrame)
    }

    animationFrame = requestAnimationFrame(renderFrame)
    return () => cancelAnimationFrame(animationFrame)
  }, [cursor, sampleSurface, settings])

  const onImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const image = new Image()
    image.onload = () => {
      imageRef.current = image
      setImageMeta({ name: file.name, width: image.width, height: image.height })
      setStatus('Image loaded. Move your cursor over the output to warp the art.')
    }
    image.onerror = () => {
      setStatus('Could not decode image. Try PNG/JPEG/WebP.')
    }
    image.src = URL.createObjectURL(file)
  }

  const onCursorMove = (event) => {
    const canvas = outputCanvasRef.current
    if (!canvas || !frameRef.current.cols || !frameRef.current.rows) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const col = (x / rect.width) * frameRef.current.cols
    const row = (y / rect.height) * frameRef.current.rows

    setCursor({ active: true, col, row, x, y })
  }

  const onCursorLeave = () => {
    setCursor((previous) => ({ ...previous, active: false, col: -1, row: -1 }))
  }

  const updateSetting = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }))
  }

  const handleExportSvg = () => {
    const frame = frameRef.current
    if (!frame.lines.length) {
      return
    }
    exportSvg(frame)
  }

  const activePresetName =
    rampPresets.find(([, value]) => value === settings.ramp)?.[0] ?? rampPresets[0][0]

  return (
    <main className="app-shell">
      <BackgroundScene />
      <section className="panel controls-panel">
        <h1>ASCIImatter Studio</h1>
        <p className="subtitle">Reactive monochrome ASCII generator for social-ready visuals.</p>

        <label className="upload" htmlFor="fileInput">
          Upload image
          <input id="fileInput" type="file" accept="image/*" onChange={onImageUpload} />
        </label>

        <p className="status">{status}</p>
        {imageMeta && (
          <p className="status meta">
            {imageMeta.name} • {imageMeta.width}×{imageMeta.height}
          </p>
        )}

        <div className="controls-grid">
          <label>
            Density ({settings.columns})
            <input
              type="range"
              min="50"
              max="240"
              value={settings.columns}
              onChange={(event) => updateSetting('columns', Number(event.target.value))}
            />
          </label>
          <label>
            Brightness ({settings.brightness})
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.brightness}
              onChange={(event) => updateSetting('brightness', Number(event.target.value))}
            />
          </label>
          <label>
            Contrast ({settings.contrast})
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.contrast}
              onChange={(event) => updateSetting('contrast', Number(event.target.value))}
            />
          </label>
          <label>
            Character ramp
            <select
              value={activePresetName}
              onChange={(event) => updateSetting('ramp', RAMP_PRESETS[event.target.value])}
            >
              {rampPresets.map(([name]) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Distortion mode
            <select
              value={settings.distortionPreset}
              onChange={(event) => updateSetting('distortionPreset', event.target.value)}
            >
              {DISTORTION_PRESETS.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
          <label>
            Radius ({settings.radius.toFixed(1)})
            <input
              type="range"
              min="2"
              max="25"
              step="0.5"
              value={settings.radius}
              onChange={(event) => updateSetting('radius', Number(event.target.value))}
            />
          </label>
          <label>
            Strength ({settings.strength.toFixed(1)})
            <input
              type="range"
              min="0.1"
              max="6"
              step="0.1"
              value={settings.strength}
              onChange={(event) => updateSetting('strength', Number(event.target.value))}
            />
          </label>
          <label>
            Recovery ({settings.recovery.toFixed(2)})
            <input
              type="range"
              min="0.6"
              max="0.99"
              step="0.01"
              value={settings.recovery}
              onChange={(event) => updateSetting('recovery', Number(event.target.value))}
            />
          </label>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.invert}
            onChange={(event) => updateSetting('invert', event.target.checked)}
          />
          Invert monochrome
        </label>

        <div className="actions">
          <button type="button" onClick={() => exportCanvas(outputCanvasRef.current, 'png')}>
            Export PNG
          </button>
          <button type="button" onClick={() => exportCanvas(outputCanvasRef.current, 'jpeg')}>
            Export JPEG
          </button>
          <button type="button" onClick={handleExportSvg}>
            Export SVG
          </button>
        </div>
      </section>

      <section className="panel output-panel">
        <div className="canvas-wrap" onMouseMove={onCursorMove} onMouseLeave={onCursorLeave}>
          <canvas ref={outputCanvasRef} className="ascii-canvas" />
          {cursor.active && (
            <span
              className="cursor-glow"
              style={{
                left: `${cursor.x}px`,
                top: `${cursor.y}px`,
                width: `${settings.radius * 22}px`,
                height: `${settings.radius * 22}px`,
              }}
            />
          )}
        </div>
      </section>
    </main>
  )
}

export default App

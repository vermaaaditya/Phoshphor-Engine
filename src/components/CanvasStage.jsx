import { useEffect, useRef, useState } from 'react';
import { RAMP_PRESETS, mapLuminanceToIndices } from '../lib/asciiMapper';
import AudioAnalyzer from '../lib/AudioAnalyzer';
import DistortionEngine from '../lib/DistortionEngine';
import { processImageToLuminance } from '../lib/imageProcessor';

const RAMP_BY_MODE = {
  RAW: RAMP_PRESETS.Classic,
  GRID: RAMP_PRESETS.Dense,
  PROC: RAMP_PRESETS.Blocks,
};

const DISTORTION_PRESET_BY_MODE = {
  RAW: 'Default',
  GRID: 'Ripple',
  PROC: 'Glitch-lite',
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function getGridMetrics(width, height, density) {
  const densityFactor = 0.35 + density / 100;
  const cols = Math.max(24, Math.round((width / 12) * densityFactor));
  const rows = Math.max(16, Math.round(cols * (height / Math.max(width, 1)) * 0.58));
  return { cols, rows };
}

export default function CanvasStage({
  density,
  contrast,
  matrixMode,
  sourceImage,
  distortionStrength,
}) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const processingCanvasRef = useRef(null);
  const distortionEngineRef = useRef(new DistortionEngine(0));
  const audioAnalyzerRef = useRef(new AudioAnalyzer());
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [asciiGrid, setAsciiGrid] = useState(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    audioAnalyzerRef.current.start();
    return () => audioAnalyzerRef.current.stop();
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!sourceImage || !stageSize.width || !stageSize.height) {
      setAsciiGrid(null);
      return undefined;
    }

    if (!processingCanvasRef.current) {
      processingCanvasRef.current = document.createElement('canvas');
    }

    const buildAsciiGrid = async () => {
      try {
        const image = await loadImage(sourceImage);
        if (cancelled) {
          return;
        }

        const { cols, rows } = getGridMetrics(stageSize.width, stageSize.height, density);
        const processingContext = processingCanvasRef.current.getContext('2d', { willReadFrequently: true });
        if (!processingContext) {
          return;
        }

        const ramp = RAMP_BY_MODE[matrixMode] ?? RAMP_PRESETS.Classic;
        const luminance = processImageToLuminance(
          image,
          cols,
          rows,
          {
            brightness: 0,
            contrast,
            invert: false,
          },
          processingCanvasRef.current,
          processingContext,
        );

        if (!cancelled) {
          setAsciiGrid({
            cols,
            rows,
            ramp,
            indices: mapLuminanceToIndices(luminance, ramp),
          });
        }
      } catch {
        if (!cancelled) {
          setAsciiGrid(null);
        }
      }
    };

    buildAsciiGrid();
    return () => {
      cancelled = true;
    };
  }, [contrast, density, matrixMode, sourceImage, stageSize.height, stageSize.width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    let frameId = 0;
    let previousTime = performance.now();

    const render = (time) => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      const devicePixelRatio = window.devicePixelRatio || 1;
      const pixelWidth = Math.round(width * devicePixelRatio);
      const pixelHeight = Math.round(height * devicePixelRatio);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-pop').trim() || '#CCFF00';
      context.textBaseline = 'top';

      if (!sourceImage || !asciiGrid) {
        context.font = '18px "JetBrains Mono", monospace';
        context.textAlign = 'center';
        context.fillText('UPLOAD_SOURCE', width / 2, height / 2 - 12);
        context.font = '12px "JetBrains Mono", monospace';
        context.fillText('LOAD AN IMAGE TO ACTIVATE THE RENDERER', width / 2, height / 2 + 14);
        previousTime = time;
        frameId = window.requestAnimationFrame(render);
        return;
      }

      const delta = Math.max(8, Math.min(33, time - previousTime || 16.67));
      previousTime = time;
      const audioMetrics = audioAnalyzerRef.current.getMetrics(time);
      const engine = distortionEngineRef.current;
      engine.resize(asciiGrid.cols, asciiGrid.rows);
      engine.update({
        time,
        delta,
        preset: DISTORTION_PRESET_BY_MODE[matrixMode] ?? 'Default',
        strength: (distortionStrength / 100) * (0.7 + audioMetrics.level * 0.6),
        audioLevel: audioMetrics.level,
        audioPulse: audioMetrics.pulse,
      });

      const cellWidth = width / asciiGrid.cols;
      const cellHeight = height / asciiGrid.rows;
      const fontSize = Math.max(8, Math.min(cellHeight * 1.03, cellWidth * 1.86));

      context.font = `${fontSize}px "JetBrains Mono", monospace`;
      context.textAlign = 'left';

      for (let row = 0; row < asciiGrid.rows; row += 1) {
        for (let col = 0; col < asciiGrid.cols; col += 1) {
          const index = row * asciiGrid.cols + col;
          const charIndex = clamp(
            Math.round(asciiGrid.indices[index] + engine.shift[index]),
            0,
            asciiGrid.ramp.length - 1,
          );
          context.fillText(
            asciiGrid.ramp[charIndex],
            col * cellWidth + engine.x[index] * cellWidth * 0.18,
            row * cellHeight + engine.y[index] * cellHeight * 0.18,
          );
        }
      }

      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [asciiGrid, distortionStrength, matrixMode, sourceImage]);

  return (
    <section ref={stageRef} className="flex-grow bg-surface-container-lowest relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-margin-sm left-margin-sm flex gap-4">
          <div className="w-4 h-4 border-t border-l border-outline-variant"></div>
          <span className="font-label-caps text-label-caps text-outline-variant uppercase">X:042 Y:119</span>
        </div>
        <div className="absolute top-margin-sm right-margin-sm">
          <div className="w-4 h-4 border-t border-r border-outline-variant ml-auto"></div>
        </div>
        <div className="absolute bottom-margin-sm left-margin-sm">
          <div className="w-4 h-4 border-b border-l border-outline-variant"></div>
        </div>
        <div className="absolute bottom-margin-sm right-margin-sm flex flex-col items-end gap-2">
          <span className="font-label-caps text-label-caps text-outline-variant uppercase">FPS: 60 // KERNEL_V2</span>
          <div className="w-4 h-4 border-b border-r border-outline-variant"></div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="ascii-canvas w-full h-full"
        onMouseLeave={() => distortionEngineRef.current.clearPointer()}
        onMouseMove={(event) => {
          if (!sourceImage || !asciiGrid) {
            return;
          }

          const rect = event.currentTarget.getBoundingClientRect();
          const relativeX = (event.clientX - rect.left) / Math.max(rect.width, 1);
          const relativeY = (event.clientY - rect.top) / Math.max(rect.height, 1);
          distortionEngineRef.current.setPointer(
            relativeX * (asciiGrid.cols - 1),
            relativeY * (asciiGrid.rows - 1),
          );
        }}
        onPointerDown={() => {
          audioAnalyzerRef.current.start();
        }}
      />

      <div className="absolute bottom-margin-md right-margin-md bg-background border border-outline-variant p-2 pointer-events-none neo-pop">
        <div className="font-data-mono text-[10px] text-accent-pop uppercase">
          PROCESS_ID: 0x9AF4<br />
          BUFFER_STATUS: REACTIVE<br />
          MEM_USE: DYNAMIC
        </div>
      </div>
    </section>
  );
}

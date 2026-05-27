import { useEffect, useRef, useState } from 'react';
import ImageProcessor from '../lib/imageProcessor';
import DistortionEngine from '../lib/DistortionEngine';
import AudioAnalyzer from '../lib/AudioAnalyzer';
import { FallingPattern } from '@/components/ui/falling-pattern';

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

// Calculates the largest rectangle that fits inside container bounds matching the ratio
function getAspectRatioSize(containerWidth, containerHeight, ratioStr) {
  if (!containerWidth || !containerHeight) {
    return { width: 0, height: 0 };
  }
  
  if (ratioStr === 'FILL') {
    return { width: containerWidth, height: containerHeight };
  }
  
  const [wRatio, hRatio] = ratioStr.split(':').map(Number);
  const targetRatio = wRatio / hRatio;
  
  let width = containerWidth;
  let height = containerWidth / targetRatio;
  
  if (height > containerHeight) {
    height = containerHeight;
    width = containerHeight * targetRatio;
  }
  
  return { width, height };
}

// Dynamic character ramps mapped strictly to active matrixMode presets
const RAMPS = {
  RAW: '@%#*+=-:. ',
  GRID: '█▓▒░ .',
  PROC: 'MWN$@B%8&#+=;:,.- ',
};

export default function CanvasStage({
  density,
  contrast,
  matrixMode,
  sourceImage,
  setSourceImage,
  distortionStrength,
  distortionRecovery,
  distortionMode,
  isAudioActive,
  exportTrigger,
  activeRamp,
  audioMode,
}) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const distortionEngineRef = useRef(null);
  const audioAnalyzerRef = useRef(new AudioAnalyzer());
  const colorInputRef = useRef(null);
  const canvasFileInputRef = useRef(null);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [luminanceData, setLuminanceData] = useState(null);
  const [grid, setGrid] = useState(null);

  // Advanced aspect ratio and background state hooks
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [canvasBg, setCanvasBg] = useState('Black');
  const [customBgColor, setCustomBgColor] = useState('#131A1C');

  // Sync canvas background HSL/Hex to a custom CSS variable
  useEffect(() => {
    let bgValue = 'transparent';
    if (canvasBg === 'Black') bgValue = '#0E0E0E';
    else if (canvasBg === 'Custom') bgValue = customBgColor;
    document.documentElement.style.setProperty('--canvas-bg', bgValue);
  }, [canvasBg, customBgColor]);

  // ResizeObserver to track container dimension changes
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

  // Compute exact visual dimensions for the canvas fitting within the stage
  // Subtract toolbar height (50px) to prevent layout overlaps
  const canvasSize = getAspectRatioSize(
    stageSize.width,
    Math.max(stageSize.height - 50, 0),
    aspectRatio
  );

  // Deferred microphone setup (starts strictly when user toggles ON)
  useEffect(() => {
    const analyzer = audioAnalyzerRef.current;
    if (isAudioActive || audioMode) {
      analyzer.init();
    } else {
      analyzer.stop();
    }
    return () => {
      analyzer.stop();
    };
  }, [isAudioActive, audioMode]);

  // Load and process image whenever source, stage scale, or density changes
  useEffect(() => {
    let cancelled = false;

    if (!sourceImage || !canvasSize.width || !canvasSize.height) {
      setLuminanceData(null);
      setGrid(null);
      distortionEngineRef.current = null;
      return undefined;
    }

    const buildGrid = async () => {
      try {
        const image = await loadImage(sourceImage);
        if (cancelled) return;

        const { cols, rows } = getGridMetrics(canvasSize.width, canvasSize.height, density);
        const luma = ImageProcessor(image, cols, rows);

        if (!cancelled) {
          // Re-create the physics distortion lattice with the exact new dimensions
          distortionEngineRef.current = new DistortionEngine(cols, rows);
          setLuminanceData(luma);
          setGrid({ cols, rows });
        }
      } catch (err) {
        console.error("Failed to load and process selected image:", err);
        if (!cancelled) {
          setLuminanceData(null);
          setGrid(null);
          distortionEngineRef.current = null;
        }
      }
    };

    buildGrid();

    return () => {
      cancelled = true;
    };
  }, [sourceImage, canvasSize.width, canvasSize.height, density]);

  // Canvas drawing & physics update loop
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

    const render = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      const dpr = window.devicePixelRatio || 1;
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      // Support High-DPI screens
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      // 1. Clear screen with Decay trails (Phosphor Decay / Heavy Decay)
      context.setTransform(1, 0, 0, 1, 0, 0);
      if (audioMode) {
        // Heavy decay for Audio Oscilloscope mode
        context.fillStyle = 'rgba(19, 19, 19, 0.3)';
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Phosphor decay for Standard Mode
        context.fillStyle = 'rgba(19, 19, 19, 0.2)';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // AUDIO OSCILLOSCOPE MODE
      if (audioMode) {
        const frequencyData = audioAnalyzerRef.current.getFrequencyData();
        
        if (frequencyData && frequencyData.length > 0) {
          context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ascii-color').trim() || '#CCFF00';
          context.font = '14px "JetBrains Mono", monospace';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          
          for (let x = 0; x < width; x += 15) {
            const freqIndex = Math.min(
              frequencyData.length - 1,
              Math.floor((x / width) * frequencyData.length)
            );
            const frequencyValue = frequencyData[freqIndex];
            const y = (height / 2) - (frequencyValue * 1.5);
            
            const chars = ['#', '@', '%', '$', '&', 'W', 'M'];
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            context.fillText(char, x, y);
          }
        }
        
        frameId = window.requestAnimationFrame(render);
        return;
      }

      // STANDARD IMAGE PROCESSING MODE
      if (!sourceImage || !grid || !luminanceData || !distortionEngineRef.current) {
        frameId = window.requestAnimationFrame(render);
        return;
      }

      const { cols, rows } = grid;
      const engine = distortionEngineRef.current;

      const bassEnergy = isAudioActive ? audioAnalyzerRef.current.getBassEnergy() : 0;

      const recovery = Math.max(0.01, distortionRecovery / 100);
      const friction = 0.90;
      const displacements = engine.update(recovery, friction, performance.now());

      context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ascii-color').trim() || '#CCFF00';
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      const fontSize = Math.max(8, Math.min(cellHeight * 1.15, cellWidth * 1.8));
      context.font = `${fontSize}px "JetBrains Mono", monospace`;
      context.textAlign = 'left';
      context.textBaseline = 'top';

      const ramp = activeRamp || '@%#*+=-:. ';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const luma = luminanceData[idx];

          let rampIndex = Math.min(ramp.length - 1, Math.max(0, Math.floor(luma * ramp.length)));
          
          // Edge Noise: add +/- 1 jitter for luma in [0.2, 0.8] range
          if (luma > 0.2 && luma < 0.8) {
            if (Math.random() > 0.9) {
              const shift = Math.random() > 0.5 ? 1 : -1;
              rampIndex = Math.min(ramp.length - 1, Math.max(0, rampIndex + shift));
            }
          }
          
          const char = ramp[rampIndex];

          const dx = displacements[idx * 2];
          const dy = displacements[idx * 2 + 1];

          const posX = c * cellWidth + dx * cellWidth;
          const posY = r * cellHeight + dy * cellHeight;

          context.fillText(char, posX, posY);
        }
      }

      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [grid, luminanceData, sourceImage, canvasBg, customBgColor, distortionRecovery, isAudioActive, matrixMode, activeRamp, audioMode]);

  // Handle canvas exporting triggers (JPEG, PNG, SVG)
  useEffect(() => {
    if (!exportTrigger || !grid || !luminanceData || !distortionEngineRef.current) {
      return;
    }

    const { format } = exportTrigger;
    const { cols, rows } = grid;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === 'SVG') {
      const displacements = distortionEngineRef.current.displacements;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      const fontSize = Math.max(8, Math.min(cellHeight * 1.15, cellWidth * 1.8));
      
      const ramp = RAMPS[matrixMode] || RAMPS.RAW;
      const lines = [];
      const offsetsX = new Float32Array(cols * rows);
      const offsetsY = new Float32Array(cols * rows);
      
      for (let r = 0; r < rows; r++) {
        let line = '';
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const luma = luminanceData[idx];
          const rampIndex = Math.min(ramp.length - 1, Math.max(0, Math.floor(luma * ramp.length)));
          line += ramp[rampIndex];
          
          offsetsX[idx] = displacements[idx * 2] * cellWidth;
          offsetsY[idx] = displacements[idx * 2 + 1] * cellHeight;
        }
        lines.push(line);
      }
      
      import('../lib/exportService').then(({ exportSvg }) => {
        exportSvg({
          lines,
          offsetsX,
          offsetsY,
          cols,
          rows,
          cellWidth,
          cellHeight,
          fontSize
        });
      });
    } else {
      // JPEG or PNG download
      import('../lib/exportService').then(({ exportCanvas }) => {
        exportCanvas(canvas, format.toLowerCase());
      });
    }
  }, [exportTrigger, grid, luminanceData, matrixMode]);

  return (
    <section ref={stageRef} className="flex-grow bg-surface-container-lowest relative overflow-hidden flex flex-col items-center justify-center pb-[50px]">
      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-margin-sm left-margin-sm flex gap-4">
          <div className="w-4 h-4 border-t border-l border-outline-variant"></div>
          <span className="font-label-caps text-label-caps text-outline-variant uppercase">X:042 Y:119</span>
        </div>
        <div className="absolute top-margin-sm right-margin-sm">
          <div className="w-4 h-4 border-t border-r border-outline-variant ml-auto"></div>
        </div>
        <div className="absolute bottom-[66px] left-margin-sm">
          <div className="w-4 h-4 border-b border-l border-outline-variant"></div>
        </div>
        <div className="absolute bottom-[66px] right-margin-sm flex flex-col items-end gap-2">
          <span className="font-label-caps text-label-caps text-outline-variant uppercase">FPS: 60 // KERNEL_V3</span>
          <div className="w-4 h-4 border-b border-r border-outline-variant"></div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
        }}
        className="ascii-canvas border border-outline-variant transition-all duration-300"
        onMouseMove={(event) => {
          if (!sourceImage || !grid || !distortionEngineRef.current) {
            return;
          }

          const rect = event.currentTarget.getBoundingClientRect();
          const relativeX = (event.clientX - rect.left) / Math.max(rect.width, 1);
          const relativeY = (event.clientY - rect.top) / Math.max(rect.height, 1);
          
          const x = relativeX * (grid.cols - 1);
          const y = relativeY * (grid.rows - 1);
          
          const bassEnergy = isAudioActive ? audioAnalyzerRef.current.getBassEnergy() : 0;
          
          // Apply interactive force pushed away from mouse
          // Scales with user set distortionStrength and real-time audio bass activity
          const baseStrength = distortionStrength / 100;
          const strength = baseStrength * (0.8 + bassEnergy * 2.5);
          const radius = 5 + bassEnergy * 10;
          
          distortionEngineRef.current.applyForce(
            x, 
            y, 
            radius, 
            strength, 
            distortionMode, 
            performance.now()
          );
        }}
      />

      {/* Retro-techy brutalist upload container box centered in the stage when empty */}
      {!sourceImage && !audioMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-surface-container-lowest z-20">
          {/* Subtle falling pattern backdrop for the empty stage area */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.14] select-none">
            <FallingPattern 
              color="var(--accent-pop)" 
              backgroundColor="transparent" 
              duration={150} 
              blurIntensity="0px" 
              density={1}
            />
          </div>

          <div 
            onClick={() => canvasFileInputRef.current?.click()}
            className="w-full max-w-[420px] border-2 border-dashed border-outline-variant hover:border-accent-pop bg-background p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 neo-pop hover:translate-y-[-2px] mx-margin-sm relative z-10"
          >
            {/* Displaying downloads ascii-art-text.png */}
            <img 
              src="/ascii-art-text.png" 
              alt="ASCII Art Text" 
              className="max-h-[110px] object-contain opacity-90 filter invert dark:invert-0"
            />
            
            <div className="h-[1px] w-full bg-outline-variant"></div>
            
            <span className="font-headline-lg text-lg text-accent-pop uppercase tracking-tighter text-center">
              UPLOAD ANY IMAGE
            </span>
            
            <span className="font-data-mono text-[10px] text-on-surface-variant uppercase text-center tracking-wider leading-relaxed">
              DRAG & DROP OR CLICK TO BROWSE<br />
              SUPPORTED: PNG, JPG, WEBP
            </span>
            
            <button 
              type="button"
              className="bg-accent-pop text-background font-data-mono font-bold py-2 px-4 text-xs uppercase border-2 border-black neo-pop-active flex items-center gap-2 mt-2"
            >
              <span>CHOOSE_FILE</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
            
            <input 
              ref={canvasFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setSourceImage(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Canvas control micro-toolbar overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-outline-variant px-margin-sm py-2.5 flex flex-wrap items-center justify-between z-10 font-data-mono text-[10px] gap-margin-sm">
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant font-label-caps text-[9px] tracking-wider">ASPECT_RATIO:</span>
          {['16:9', '4:3', '1:1', '9:16', 'FILL'].map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-2 py-0.5 uppercase border border-outline-variant font-data-mono transition-all duration-200 ${
                aspectRatio === ratio 
                  ? 'bg-accent-pop text-background border-black font-bold neo-pop' 
                  : 'hover:text-accent-pop hover:bg-surface-variant'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant font-label-caps text-[9px] tracking-wider">CANVAS_BG:</span>
          {['Black', 'Transparent', 'Custom'].map((bg) => (
            <button
              key={bg}
              onClick={() => {
                setCanvasBg(bg);
                if (bg === 'Custom' && colorInputRef.current) {
                  colorInputRef.current.click();
                }
              }}
              className={`px-2 py-0.5 uppercase border border-outline-variant font-data-mono transition-all duration-200 ${
                canvasBg === bg 
                  ? 'bg-accent-pop text-background border-black font-bold neo-pop' 
                  : 'hover:text-accent-pop hover:bg-surface-variant'
              }`}
            >
              {bg}
            </button>
          ))}
          <input
            ref={colorInputRef}
            type="color"
            value={customBgColor}
            onChange={(e) => {
              setCustomBgColor(e.target.value);
              setCanvasBg('Custom');
            }}
            className="w-5 h-5 bg-transparent border-0 cursor-pointer hidden"
          />
          {canvasBg === 'Custom' && (
            <span 
              className="text-[9px] uppercase border border-outline-variant px-1 font-bold"
              style={{ color: customBgColor }}
            >
              {customBgColor}
            </span>
          )}
        </div>
      </div>

      <div className="absolute bottom-margin-md right-margin-md bg-background border border-outline-variant p-2 pointer-events-none neo-pop mb-[40px]">
        <div className="font-data-mono text-[10px] text-accent-pop uppercase">
          PROCESS_ID: 0x9AF4<br />
          BUFFER_STATUS: REACTIVE<br />
          MEM_USE: DYNAMIC
        </div>
      </div>
    </section>
  );
}

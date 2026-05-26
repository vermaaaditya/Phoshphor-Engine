import { useRef } from 'react';
import ThemeTuner from './ThemeTuner';

const MATRIX_MODES = ['RAW', 'GRID', 'PROC'];

export default function Cockpit({
  density,
  setDensity,
  contrast,
  setContrast,
  matrixMode,
  setMatrixMode,
  sourceImage,
  setSourceImage,
  distortionStrength,
  setDistortionStrength,
}) {
  const fileInputRef = useRef(null);

  const handleUpload = (event) => {
    const [file] = event.target.files ?? [];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSourceImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <aside className="flex flex-col h-full border-r border-outline-variant w-1/4 min-w-[300px] bg-background overflow-y-auto">
      <div className="p-margin-sm border-b border-outline-variant">
        <div className="flex justify-between items-start mb-2">
          <span className="font-data-mono text-data-mono text-accent-pop">ENGINE_V.1.0.4</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">LATENCY: 12MS</span>
        </div>
        <div className="flex gap-1">
          <div className="h-1 flex-grow bg-accent-pop"></div>
          <div className="h-1 flex-grow bg-outline-variant"></div>
          <div className="h-1 flex-grow bg-outline-variant"></div>
          <div className="h-1 flex-grow bg-outline-variant"></div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center h-12 border-b border-outline-variant px-margin-sm border-l-[4px] border-accent-pop text-accent-pop bg-surface-container-low cursor-pointer transition-transform active:translate-x-1">
          <span className="material-symbols-outlined mr-margin-sm">tune</span>
          <span className="font-data-mono text-data-mono uppercase">COCKPIT</span>
        </div>
      </div>

      <div className="p-margin-sm flex flex-col gap-margin-md flex-grow">
        <div className="flex flex-col gap-2">
          <button
            className="w-full bg-accent-pop text-background font-data-mono py-3 font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase border-2 border-black neo-pop-active"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            UPLOAD_SOURCE
          </button>
          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handleUpload}
          />
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
            {sourceImage ? 'SOURCE_READY' : 'NO_SOURCE'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">DENSITY</label>
            <span className="font-data-mono text-data-mono text-accent-pop">{(density / 100).toFixed(2)}</span>
          </div>
          <input className="w-full" max="100" min="0" type="range" value={density} onChange={(event) => setDensity(Number(event.target.value))} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">CONTRAST</label>
            <span className="font-data-mono text-data-mono text-accent-pop">{contrast}</span>
          </div>
          <input className="w-full" max="100" min="-100" type="range" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">DISTORTION</label>
            <span className="font-data-mono text-data-mono text-accent-pop">{(distortionStrength / 100).toFixed(2)}</span>
          </div>
          <input className="w-full" max="100" min="0" type="range" value={distortionStrength} onChange={(event) => setDistortionStrength(Number(event.target.value))} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">MATRIX_MODE</label>
          <div className="grid grid-cols-3 border border-outline-variant">
            {MATRIX_MODES.map((mode) => (
              <button
                key={mode}
                className={`font-data-mono text-data-mono py-2 uppercase ${matrixMode === mode ? 'bg-accent-pop text-background font-bold border border-black neo-pop' : 'hover:bg-surface-variant border-l border-outline-variant'}`}
                type="button"
                onClick={() => setMatrixMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <ThemeTuner />
      </div>

      <div className="p-margin-sm border-t border-outline-variant">
        <button className="w-full bg-accent-pop text-background font-data-mono py-3 font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase border-2 border-black neo-pop-active">
          EXPORT_RESULT
        </button>
      </div>
    </aside>
  );
}

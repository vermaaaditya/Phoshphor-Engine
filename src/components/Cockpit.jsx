import { useRef } from 'react';
import ThemeTuner from './ThemeTuner';
import { FallingPattern } from '@/components/ui/falling-pattern';
import { PRESETS } from '../lib/presets';

const MATRIX_MODES_WITH_ICONS = [
  { mode: 'RAW', icon: 'photo' },
  { mode: 'GRID', icon: 'grid_on' },
  { mode: 'PROC', icon: 'memory' },
];

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
  distortionRecovery,
  setDistortionRecovery,
  distortionMode,
  setDistortionMode,
  isAudioActive,
  setIsAudioActive,
  isRgbActive,
  setIsRgbActive,
  exportFormat,
  setExportFormat,
  onExport,
  activePreset,
  applyPreset,
  audioMode,
  setAudioMode,
  setLoginModalOpen,
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
    <aside className="flex flex-col h-full border-r border-outline-variant w-1/4 min-w-[300px] bg-background overflow-y-auto relative">
      {/* Subtle sci-fi HSL-linked falling pattern inside Cockpit panel */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] select-none">
        <FallingPattern 
          color="var(--accent-pop)" 
          backgroundColor="transparent" 
          duration={150} 
          blurIntensity="0px" 
          density={1}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Header telemetry readout */}
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

        {/* Control sliders and menus */}
        <div className="p-margin-sm flex flex-col gap-margin-md flex-grow">
          {/* Aesthetic Presets */}
          <div className="flex flex-col gap-2 border-b border-outline-variant pb-4">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">AESTHETIC_PRESETS</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESETS).map((key) => {
                const preset = PRESETS[key];
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    className={`font-data-mono py-2 uppercase text-[10px] text-center border-2 border-black transition-all flex items-center justify-center gap-1 ${
                      isActive 
                        ? 'bg-accent-pop text-background font-bold border-black neo-pop-active' 
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Action */}
          <div className="flex flex-col gap-2">
            <button
              className="w-full bg-accent-pop text-background font-data-mono py-3 font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase border-2 border-black neo-pop-active flex items-center justify-center gap-2"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>UPLOAD</span>
              <span className="material-symbols-outlined text-base">upload</span>
            </button>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handleUpload}
            />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase text-center">
              {sourceImage ? 'SOURCE_READY' : 'NO_SOURCE'}
            </span>
          </div>

          {/* 1. DEFERRED AUDIO CONTROL */}
          <div className="flex flex-col gap-2 border-b border-outline-variant pb-4">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">AUDIO_REACTIVITY</label>
            <button
              onClick={() => setIsAudioActive(!isAudioActive)}
              className={`w-full font-data-mono py-3 font-bold uppercase flex items-center justify-center gap-2 border-2 border-black neo-pop-active transition-all ${
                isAudioActive 
                  ? 'bg-accent-pop text-background border-black' 
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
              }`}
              type="button"
            >
              <span>AUDIO_REACT: {isAudioActive ? 'ON' : 'OFF'}</span>
              <span className="material-symbols-outlined text-base">
                {isAudioActive ? 'mic' : 'mic_off'}
              </span>
            </button>
            <button
              onClick={() => setAudioMode(!audioMode)}
              className={`w-full font-data-mono py-3 font-bold uppercase flex items-center justify-center gap-2 border-2 border-black neo-pop-active transition-all ${
                audioMode 
                  ? 'bg-accent-pop text-background border-black' 
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
              }`}
              type="button"
            >
              <span>AUDIO_OSCILLOSCOPE: {audioMode ? 'ON' : 'OFF'}</span>
              <span className="material-symbols-outlined text-base">
                {audioMode ? 'graphic_eq' : 'equalizer'}
              </span>
            </button>
          </div>

          {/* 2. DENSITY & CONTRAST */}
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-4">
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
          </div>

          {/* 3. CORE PHYSICS & DISTORTION TUNING */}
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">DISTORTION_MODE</label>
              <div className="relative">
                <select
                  value={distortionMode}
                  onChange={(e) => setDistortionMode(e.target.value)}
                  className="w-full bg-surface-container-high border-2 border-outline-variant p-2 font-data-mono text-data-mono uppercase text-accent-pop appearance-none focus:outline-none cursor-pointer focus:border-accent-pop text-sm"
                >
                  <option value="Warp">Warp (Radial)</option>
                  <option value="Ripple">Ripple (Wave)</option>
                  <option value="Glitch-lite">Glitch-lite (Noise)</option>
                </select>
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_drop_down</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">STRENGTH</label>
                <span className="font-data-mono text-data-mono text-accent-pop">{(distortionStrength / 100).toFixed(2)}</span>
              </div>
              <input 
                className="w-full" 
                max="100" 
                min="0" 
                type="range" 
                value={distortionStrength} 
                onChange={(e) => setDistortionStrength(Number(e.target.value))} 
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">RECOVERY</label>
                <span className="font-data-mono text-data-mono text-accent-pop">{(distortionRecovery / 100).toFixed(2)}</span>
              </div>
              <input 
                className="w-full" 
                max="100" 
                min="1" 
                type="range" 
                value={distortionRecovery} 
                onChange={(e) => setDistortionRecovery(Number(e.target.value))} 
              />
            </div>
          </div>

          {/* 4. MATRIX MODE TABS */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">MATRIX_MODE</label>
            <div className="grid grid-cols-3 border border-outline-variant">
              {MATRIX_MODES_WITH_ICONS.map(({ mode, icon }) => (
                <button
                  key={mode}
                  className={`font-data-mono text-data-mono py-2 uppercase flex items-center justify-center gap-1 text-xs ${matrixMode === mode ? 'bg-accent-pop text-background font-bold border border-black neo-pop' : 'hover:bg-surface-variant border-l border-outline-variant'}`}
                  type="button"
                  onClick={() => setMatrixMode(mode)}
                >
                  <span>{mode}</span>
                  <span className="material-symbols-outlined text-xs">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. DECOUPLED INDEPENDENT TUNERS & RGB MODE */}
          <div className="flex flex-col gap-margin-sm border-t border-outline-variant pt-4 pb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">RGB_MODE</label>
              <button
                onClick={() => setIsRgbActive(!isRgbActive)}
                className={`font-data-mono py-1.5 px-3 uppercase text-[10px] border-2 border-black neo-pop-active transition-all flex items-center gap-1.5 ${
                  isRgbActive 
                    ? 'bg-accent-pop text-background font-bold border-black' 
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                }`}
                type="button"
              >
                <span>RGB_CYCLING: {isRgbActive ? 'ON' : 'OFF'}</span>
                <span className="material-symbols-outlined text-xs">
                  {isRgbActive ? 'filter_tilt_shift' : 'hdr_strong'}
                </span>
              </button>
            </div>

            <div className={`transition-all duration-300 ${isRgbActive ? 'opacity-40 pointer-events-none' : ''}`}>
              <ThemeTuner label="SYS_THEME" cssVar="--accent-pop" initialHue={75} />
              <ThemeTuner label="ASCII_TINT" cssVar="--ascii-color" initialHue={140} />
            </div>
          </div>
        </div>

        {/* 6. EXPORT ACTION & FORMAT BUTTONS */}
        <div className="p-margin-sm border-t border-outline-variant flex flex-col gap-2 bg-background relative z-10">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase text-[9px] tracking-wider">EXPORT_FORMAT</label>
            <div className="grid grid-cols-3 border border-outline-variant">
              {['JPEG', 'PNG', 'SVG'].map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  type="button"
                  className={`font-data-mono py-1.5 uppercase flex items-center justify-center gap-1 text-[10px] ${
                    exportFormat === format 
                      ? 'bg-accent-pop text-background font-bold border border-black neo-pop' 
                      : 'hover:bg-surface-variant border-l border-outline-variant text-on-surface-variant'
                  }`}
                >
                  <span>{format}</span>
                  <span className="material-symbols-outlined text-xs">
                    {format === 'SVG' ? 'code' : 'image'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setLoginModalOpen(true)}
            className="w-full bg-accent-pop text-background font-data-mono py-3 font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase border-2 border-black neo-pop-active flex items-center justify-center gap-2 mt-1"
          >
            <span>EXPORT</span>
            <span className="material-symbols-outlined text-base">download</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

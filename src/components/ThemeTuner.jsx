import { useState, useEffect } from 'react';

/**
 * ThemeTuner is a reusable HSL tuner slider that binds to an HTML document root CSS variable.
 * 
 * @param {string} label - Display label (e.g. SYS_THEME)
 * @param {string} cssVar - Target CSS variable to update (e.g. --accent-pop)
 * @param {number} initialHue - Default hue index (0-360)
 */
export default function ThemeTuner({ label = 'SYS_THEME', cssVar = '--accent-pop', initialHue = 75 }) {
  const [hue, setHue] = useState(initialHue);

  useEffect(() => {
    document.documentElement.style.setProperty(cssVar, `hsl(${hue}, 100%, 50%)`);
  }, [hue, cssVar]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
          {label}
        </label>
        <span 
          className="font-data-mono text-data-mono font-bold"
          style={{ color: `var(${cssVar})` }}
        >
          HSL({hue})
        </span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="360" 
        value={hue}
        onChange={(e) => setHue(Number(e.target.value))}
        className="hue-slider w-full cursor-crosshair mt-1"
      />
    </div>
  );
}

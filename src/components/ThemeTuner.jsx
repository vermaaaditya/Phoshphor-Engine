import { useState, useEffect } from 'react';

export default function ThemeTuner() {
  const [hue, setHue] = useState(75);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-pop', `hsl(${hue}, 100%, 50%)`);
  }, [hue]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
          SYS_THEME
        </label>
        <span className="font-data-mono text-data-mono text-accent-pop">
          HSL({hue})
        </span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="360" 
        value={hue}
        onChange={(e) => setHue(e.target.value)}
        className="hue-slider w-full cursor-crosshair mt-1"
      />
    </div>
  );
}

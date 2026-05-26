# PhosphorEngine - React Refactor Instructions

Please create or update the following files in the project directory using the exact code provided below. 

## 1. Configuration & CSS

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "#131313",
        "on-background": "#e4e2e1",
        "surface": "#131313",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1b1c1c",
        "surface-container-high": "#2a2a2a",
        "surface-variant": "#353535",
        "on-surface": "#e4e2e1",
        "on-surface-variant": "#b9cacb",
        "outline-variant": "#3b494b",
        "accent-pop": "var(--accent-pop)", 
      },
      spacing: {
        "grid-line": "1px",
        "margin-lg": "64px",
        "margin-md": "32px",
        "margin-sm": "16px"
      },
      fontFamily: {
        "data-mono": ["JetBrains Mono", "monospace"],
        "body-md": ["JetBrains Mono", "monospace"],
        "headline-lg": ["JetBrains Mono", "monospace"],
        "label-caps": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "data-mono": ["12px", { lineHeight: "1.0", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" }],
        "headline-lg": ["40px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-caps": ["10px", { lineHeight: "1.2", letterSpacing: "0.15em", fontWeight: "700" }]
      }
    },
  },
  plugins: [],
}
```

### `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('[https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@600;700&display=swap](https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@600;700&display=swap)');
@import url('[https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap)');

:root {
  --accent-pop: #CCFF00; 
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(-10%, 5%); }
  30% { transform: translate(5%, -10%); }
  40% { transform: translate(-5%, 15%); }
  50% { transform: translate(-10%, 5%); }
  60% { transform: translate(15%, 0); }
  70% { transform: translate(0, 10%); }
  80% { transform: translate(-15%, 0); }
  90% { transform: translate(10%, 5%); }
}

.film-grain {
  position: fixed;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: url("[https://www.transparenttextures.com/patterns/stardust.png](https://www.transparenttextures.com/patterns/stardust.png)");
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
  animation: grain 8s steps(10) infinite;
}

.ascii-canvas {
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
  letter-spacing: 0;
  white-space: pre;
  user-select: none;
}

input[type=range]:not(.hue-slider) {
  -webkit-appearance: none;
  background: transparent;
}
input[type=range]:not(.hue-slider)::-webkit-slider-runnable-track {
  width: 100%;
  height: 2px;
  background: #3b494b;
}
input[type=range]:not(.hue-slider)::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  background: var(--accent-pop);
  margin-top: -5px;
  cursor: pointer;
  border: 1px solid #000;
}

.hue-slider {
  -webkit-appearance: none;
  background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
  height: 4px;
  width: 100%;
}
.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 8px;
  height: 16px;
  background: #fff;
  border: 1px solid #000;
  cursor: ew-resize;
}

.neo-pop { box-shadow: 2px 2px 0px 0px #000; }
.neo-pop-active { box-shadow: 4px 4px 0px 0px #000; }
```

## 2. React Components

### `src/components/ThemeTuner.jsx`
```jsx
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
```

### `src/components/Header.jsx`
```jsx
export default function Header() {
  return (
    <header className="flex justify-between items-center w-full px-margin-sm h-16 border-b border-outline-variant bg-background">
      <div className="flex items-center gap-margin-md">
        <span className="font-headline-lg text-headline-lg text-on-background tracking-tighter uppercase">PHOSPHOR</span>
        <nav className="hidden md:flex gap-margin-md items-center h-full">
          <a className="font-data-mono text-data-mono uppercase text-accent-pop border-b border-accent-pop h-16 flex items-center px-2" href="#">WORKSPACE</a>
          <a className="font-data-mono text-data-mono uppercase text-on-surface-variant hover:text-accent-pop transition-colors h-16 flex items-center px-2" href="#">ARCHIVE</a>
          <a className="font-data-mono text-data-mono uppercase text-on-surface-variant hover:text-accent-pop transition-colors h-16 flex items-center px-2" href="#">GALLERY</a>
        </nav>
      </div>
      <div className="flex items-center gap-margin-sm">
        <button className="material-symbols-outlined text-on-surface-variant hover:text-accent-pop transition-colors">terminal</button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-accent-pop transition-colors">settings</button>
        <div className="w-8 h-8 bg-surface-container-high border border-outline-variant overflow-hidden neo-pop">
          <img alt="User Terminal Profile" className="w-full h-full" src="[https://api.dicebear.com/7.x/pixel-art/svg?seed=Phosphor](https://api.dicebear.com/7.x/pixel-art/svg?seed=Phosphor)" />
        </div>
      </div>
    </header>
  );
}
```

### `src/components/Cockpit.jsx`
```jsx
import { useState } from 'react';
import ThemeTuner from './ThemeTuner';

export default function Cockpit() {
  const [density, setDensity] = useState(82);

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
          <div className="flex justify-between items-baseline">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">DENSITY</label>
            <span className="font-data-mono text-data-mono text-accent-pop">{(density / 100).toFixed(2)}</span>
          </div>
          <input className="w-full" max="100" min="0" type="range" value={density} onChange={(e) => setDensity(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">MATRIX_MODE</label>
          <div className="grid grid-cols-3 border border-outline-variant">
            <button className="font-data-mono text-data-mono py-2 bg-accent-pop text-background uppercase font-bold border border-black neo-pop">RAW</button>
            <button className="font-data-mono text-data-mono py-2 hover:bg-surface-variant border-l border-outline-variant uppercase">GRID</button>
            <button className="font-data-mono text-data-mono py-2 hover:bg-surface-variant border-l border-outline-variant uppercase">PROC</button>
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
```

### `src/components/CanvasStage.jsx`
```jsx
import { useEffect, useState } from 'react';

const initialArt = `        _____________________
       /                    /|
      /      PHOSPHOR      / |
     /____________________/  |
     |                    |  |
     |   [GENERATIVE]     |  |
     |   {  ENGINE  }     |  |
     |                    |  |
     |      GRID_01       |  |
     |____________________| /
     |____________________|/

     ::::::::::::::::::::::
     ::                  ::
     ::   +----------+   ::
     ::   |  SYSTEM  |   ::
     ::   +----------+   ::
     ::                  ::
     ::::::::::::::::::::::`;

export default function CanvasStage() {
  const [asciiText, setAsciiText] = useState(initialArt);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.90) {
        const index = Math.floor(Math.random() * initialArt.length);
        const chars = ["/", "\\", "|", "_", "+", "X", "0", "1"];
        const glitchChar = chars[Math.floor(Math.random() * chars.length)];
        
        const newText = initialArt.substring(0, index) + glitchChar + initialArt.substring(index + 1);
        setAsciiText(newText);
        
        setTimeout(() => setAsciiText(initialArt), 50);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex-grow bg-surface-container-lowest relative overflow-hidden flex items-center justify-center">
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
          <span className="font-label-caps text-label-caps text-outline-variant uppercase">FPS: 60 // KERNEL_V1</span>
          <div className="w-4 h-4 border-b border-r border-outline-variant"></div>
        </div>
      </div>

      <div className="ascii-canvas text-on-background text-[10px] md:text-[14px] leading-none text-center">
        <pre>{asciiText}</pre>
      </div>

      <div className="absolute bottom-margin-md right-margin-md bg-background border border-outline-variant p-2 pointer-events-none neo-pop">
        <div className="font-data-mono text-[10px] text-accent-pop uppercase">
          PROCESS_ID: 0x9AF4<br/>
          BUFFER_STATUS: STABLE<br/>
          MEM_USE: 42.4MB
        </div>
      </div>
    </section>
  );
}
```

### `src/App.jsx`
```jsx
import Header from './components/Header';
import Cockpit from './components/Cockpit';
import CanvasStage from './components/CanvasStage';

function App() {
  return (
    <div className="bg-background text-on-background font-body-md overflow-hidden h-screen flex flex-col border-grid-line border-outline-variant">
      <div className="film-grain"></div>
      
      <Header />
      
      <main className="flex-grow flex w-full overflow-hidden">
        <Cockpit />
        <CanvasStage />
      </main>
      
      <footer className="md:hidden flex justify-around items-center h-16 bg-background border-t border-outline-variant">
        <button className="flex flex-col items-center gap-1 text-accent-pop">
          <span className="material-symbols-outlined">tune</span>
          <span className="font-data-mono text-[10px] uppercase">COCKPIT</span>
        </button>
      </footer>
    </div>
  );
}

export default App;

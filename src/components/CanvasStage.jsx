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

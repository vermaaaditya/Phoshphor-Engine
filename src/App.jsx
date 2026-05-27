import { useState, useEffect } from 'react';
import Header from './components/Header';
import Cockpit from './components/Cockpit';
import CanvasStage from './components/CanvasStage';
import BackgroundScene from './components/BackgroundScene';

function App() {
  const [density, setDensity] = useState(82);
  const [contrast, setContrast] = useState(10);
  const [matrixMode, setMatrixMode] = useState('RAW');
  const [sourceImage, setSourceImage] = useState(null);
  
  // Decoupled Distortion and Interactive physics states
  const [distortionStrength, setDistortionStrength] = useState(48);
  const [distortionRecovery, setDistortionRecovery] = useState(8);
  const [distortionMode, setDistortionMode] = useState('Warp');

  // Microphone deferred activation state
  const [isAudioActive, setIsAudioActive] = useState(false);

  // Routing view state
  const [currentView, setCurrentView] = useState('workspace');

  // Exporter states (JPEG, PNG, SVG)
  const [exportFormat, setExportFormat] = useState('PNG');
  const [exportTrigger, setExportTrigger] = useState(null);

  // 1. Rainbow RGB color cycling state
  const [isRgbActive, setIsRgbActive] = useState(false);

  // 2. High-performance requestAnimationFrame color cycling loop
  useEffect(() => {
    if (!isRgbActive) return undefined;

    let frameId;
    let hue = 0;

    const cycle = () => {
      // Shifting increment rate (smooth cycling speed)
      hue = (hue + 0.4) % 360;

      // Update HSL properties on document root
      document.documentElement.style.setProperty('--accent-pop', `hsl(${hue}, 100%, 50%)`);
      // Shift ASCII tint by a 120-degree phase offset for a beautiful dual-hue sliding gradient
      document.documentElement.style.setProperty('--ascii-color', `hsl(${(hue + 120) % 360}, 100%, 50%)`);

      frameId = requestAnimationFrame(cycle);
    };

    frameId = requestAnimationFrame(cycle);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isRgbActive]);

  return (
    <div className="bg-background text-on-background font-body-md overflow-hidden h-screen flex flex-col border-grid-line border-outline-variant relative">
      <div className="film-grain"></div>
      
      {/* Dynamic sci-fi HSL-linked falling pattern background */}
      <BackgroundScene />
      
      {/* Dynamic Header routing */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      {currentView === 'workspace' ? (
        <main className="flex-grow flex w-full overflow-hidden relative z-10">
          <Cockpit
            density={density}
            setDensity={setDensity}
            contrast={contrast}
            setContrast={setContrast}
            matrixMode={matrixMode}
            setMatrixMode={setMatrixMode}
            sourceImage={sourceImage}
            setSourceImage={setSourceImage}
            distortionStrength={distortionStrength}
            setDistortionStrength={setDistortionStrength}
            distortionRecovery={distortionRecovery}
            setDistortionRecovery={setDistortionRecovery}
            distortionMode={distortionMode}
            setDistortionMode={setDistortionMode}
            isRgbActive={isRgbActive}
            setIsRgbActive={setIsRgbActive}
            isAudioActive={isAudioActive}
            setIsAudioActive={setIsAudioActive}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            onExport={() => setExportTrigger({ format: exportFormat, timestamp: Date.now() })}
          />
          <CanvasStage
            density={density}
            contrast={contrast}
            matrixMode={matrixMode}
            sourceImage={sourceImage}
            setSourceImage={setSourceImage}
            distortionStrength={distortionStrength}
            distortionRecovery={distortionRecovery}
            distortionMode={distortionMode}
            isAudioActive={isAudioActive}
            exportTrigger={exportTrigger}
          />
        </main>
      ) : (
        /* Brutalist offline empty state for navigation links */
        <main className="flex-grow flex flex-col items-center justify-center bg-surface-container-lowest relative overflow-hidden border-t border-outline-variant z-10">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-margin-sm left-margin-sm flex gap-4">
              <div className="w-4 h-4 border-t border-l border-outline-variant"></div>
              <span className="font-label-caps text-label-caps text-outline-variant uppercase">ROUTE: {currentView}</span>
            </div>
            <div className="absolute top-margin-sm right-margin-sm">
              <div className="w-4 h-4 border-t border-r border-outline-variant ml-auto"></div>
            </div>
            <div className="absolute bottom-margin-sm left-margin-sm">
              <div className="w-4 h-4 border-b border-l border-outline-variant"></div>
            </div>
            <div className="absolute bottom-margin-sm right-margin-sm">
              <div className="w-4 h-4 border-b border-r border-outline-variant"></div>
            </div>
          </div>
          
          <div className="text-center p-8 bg-background border-2 border-black neo-pop max-w-md mx-margin-sm">
            <h2 className="font-headline-lg text-2xl text-accent-pop uppercase mb-4 tracking-tighter">MODULE_OFFLINE</h2>
            <p className="font-data-mono text-data-mono text-on-surface-variant uppercase tracking-wider mb-6 text-left">
              SYSTEM_ROUTE: /{currentView}<br />
              STATUS: COMING_SOON<br />
              CODE: 0x404_OFFLINE
            </p>
            <div className="h-1 bg-accent-pop w-full mb-6"></div>
            <button 
              onClick={() => setCurrentView('workspace')}
              className="bg-accent-pop text-background font-data-mono font-bold py-3 px-6 uppercase border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all neo-pop-active"
            >
              RETURN_TO_WORKSPACE
            </button>
          </div>
        </main>
      )}
      
      <footer className="md:hidden flex justify-around items-center h-16 bg-background border-t border-outline-variant relative z-10">
        <button 
          onClick={() => setCurrentView('workspace')}
          className={`flex flex-col items-center gap-1 ${currentView === 'workspace' ? 'text-accent-pop' : 'text-on-surface-variant'}`}
        >
          <span className="material-symbols-outlined">tune</span>
          <span className="font-data-mono text-[10px] uppercase">COCKPIT</span>
        </button>
      </footer>
    </div>
  );
}

export default App;

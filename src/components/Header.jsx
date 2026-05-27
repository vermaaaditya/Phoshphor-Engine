export default function Header({ currentView, setCurrentView }) {
  return (
    <header className="flex justify-between items-center w-full px-margin-sm h-16 border-b border-outline-variant bg-background">
      <div className="flex items-center gap-margin-md">
        <span 
          onClick={() => setCurrentView('workspace')}
          className="font-headline-lg text-headline-lg text-on-background tracking-tighter uppercase cursor-pointer hover:text-accent-pop transition-colors"
        >
          PHOSPHOR
        </span>
        <nav className="hidden md:flex gap-margin-md items-center h-full">
          <button 
            onClick={() => setCurrentView('workspace')} 
            className={`font-data-mono text-data-mono uppercase h-16 flex items-center px-2 border-b-2 transition-all ${
              currentView === 'workspace' 
                ? 'text-accent-pop border-accent-pop font-bold' 
                : 'text-on-surface-variant border-transparent hover:text-accent-pop hover:border-outline-variant'
            }`}
          >
            WORKSPACE
          </button>
          <button 
            onClick={() => setCurrentView('archive')} 
            className={`font-data-mono text-data-mono uppercase h-16 flex items-center px-2 border-b-2 transition-all ${
              currentView === 'archive' 
                ? 'text-accent-pop border-accent-pop font-bold' 
                : 'text-on-surface-variant border-transparent hover:text-accent-pop hover:border-outline-variant'
            }`}
          >
            ARCHIVE
          </button>
          <button 
            onClick={() => setCurrentView('gallery')} 
            className={`font-data-mono text-data-mono uppercase h-16 flex items-center px-2 border-b-2 transition-all ${
              currentView === 'gallery' 
                ? 'text-accent-pop border-accent-pop font-bold' 
                : 'text-on-surface-variant border-transparent hover:text-accent-pop hover:border-outline-variant'
            }`}
          >
            GALLERY
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-margin-sm">
        <button 
          onClick={() => setCurrentView('workspace')}
          className="material-symbols-outlined text-on-surface-variant hover:text-accent-pop transition-colors"
        >
          terminal
        </button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-accent-pop transition-colors">settings</button>
        <div className="w-8 h-8 bg-surface-container-high border border-outline-variant overflow-hidden neo-pop">
          <img alt="User Profile" className="w-full h-full" src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Phosphor" />
        </div>
      </div>
    </header>
  );
}

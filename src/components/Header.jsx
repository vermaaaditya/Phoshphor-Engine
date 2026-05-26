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

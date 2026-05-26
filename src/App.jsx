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

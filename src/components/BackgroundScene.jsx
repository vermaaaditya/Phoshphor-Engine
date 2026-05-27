import { FallingPattern } from '@/components/ui/falling-pattern';

/**
 * BackgroundScene is a dynamic sci-fi grid overlay.
 * Uses the custom HSL --accent-pop color to sync with the cockpit HSL slider.
 */
export default function BackgroundScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.14] select-none">
      <FallingPattern 
        color="var(--accent-pop)" 
        backgroundColor="transparent" 
        duration={150} 
        blurIntensity="0px"
        density={1}
      />
    </div>
  );
}

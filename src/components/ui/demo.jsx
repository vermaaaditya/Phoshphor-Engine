import { FallingPattern } from '@/components/ui/falling-pattern';

/**
 * DefaultDemo displays a full-screen instance of FallingPattern with mask overlays.
 */
export default function DefaultDemo() {
  return (
    <div className="w-full relative min-h-screen bg-background text-on-background">
      <FallingPattern className="h-screen [mask-image:radial-gradient(ellipse_at_center,transparent,var(--background))]" />
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <h1 className="font-headline-lg text-7xl font-extrabold tracking-tighter uppercase text-accent-pop">
          Falling Pattern
        </h1>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * FallingPattern is a highly custom grid canvas animation rendering particles and visual matrix lines.
 * Synchronized globally across all instances via unified document-clock CSS keyframes.
 */
export function FallingPattern({
  color = 'var(--primary)',
  backgroundColor = 'var(--background)',
  duration = 150,
  blurIntensity = '1em',
  density = 1,
  className,
}) {
  // Generate background image style with customizable color
  const generateBackgroundImage = () => {
    const patterns = [
      // Row 1
      `radial-gradient(4px 100px at 0px 235px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 235px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 117.5px, ${color} 100%, transparent 150%)`,
      // Row 2
      `radial-gradient(4px 100px at 0px 252px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 252px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 126px, ${color} 100%, transparent 150%)`,
      // Row 3
      `radial-gradient(4px 100px at 0px 150px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 150px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 75px, ${color} 100%, transparent 150%)`,
      // Row 4
      `radial-gradient(4px 100px at 0px 253px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 253px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 126.5px, ${color} 100%, transparent 150%)`,
      // Row 5
      `radial-gradient(4px 100px at 0px 204px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 204px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 102px, ${color} 100%, transparent 150%)`,
      // Row 6
      `radial-gradient(4px 100px at 0px 134px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 134px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 67px, ${color} 100%, transparent 150%)`,
      // Row 7
      `radial-gradient(4px 100px at 0px 179px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 179px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 89.5px, ${color} 100%, transparent 150%)`,
      // Row 8
      `radial-gradient(4px 100px at 0px 299px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 299px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 149.5px, ${color} 100%, transparent 150%)`,
      // Row 9
      `radial-gradient(4px 100px at 0px 215px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 215px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 107.5px, ${color} 100%, transparent 150%)`,
      // Row 10
      `radial-gradient(4px 100px at 0px 281px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 281px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 140.5px, ${color} 100%, transparent 150%)`,
      // Row 11
      `radial-gradient(4px 100px at 0px 158px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 158px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 79px, ${color} 100%, transparent 150%)`,
      // Row 12
      `radial-gradient(4px 100px at 0px 210px, ${color}, transparent)`,
      `radial-gradient(4px 100px at 300px 210px, ${color}, transparent)`,
      `radial-gradient(1.5px 1.5px at 150px 105px, ${color} 100%, transparent 150%)`,
    ];

    return patterns.join(', ');
  };

  const backgroundSizes = [
    '300px 235px',
    '300px 235px',
    '300px 235px',
    '300px 252px',
    '300px 252px',
    '300px 252px',
    '300px 150px',
    '300px 150px',
    '300px 150px',
    '300px 253px',
    '300px 253px',
    '300px 253px',
    '300px 204px',
    '300px 204px',
    '300px 204px',
    '300px 134px',
    '300px 134px',
    '300px 134px',
    '300px 179px',
    '300px 179px',
    '300px 179px',
    '300px 299px',
    '300px 299px',
    '300px 299px',
    '300px 215px',
    '300px 215px',
    '300px 215px',
    '300px 281px',
    '300px 281px',
    '300px 281px',
    '300px 158px',
    '300px 158px',
    '300px 158px',
    '300px 210px',
    '300px 210px',
  ].join(', ');

  const animationDelay = useMemo(() => {
    const time = typeof performance !== 'undefined' ? performance.now() : 0;
    return `-${(time / 1000) % duration}s`;
  }, [duration]);

  const patternId = useMemo(() => `fp-${Math.random().toString(36).substring(2, 9)}`, []);

  return (
    <div className={cn('relative h-full w-full p-1', className)}>
      <style dangerouslySetInnerHTML={{ __html: `
        #${patternId} {
          background-image: ${generateBackgroundImage()};
        }
      `}} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="size-full"
      >
        {/* Driven by global hardware accelerated keyframes animation */}
        <div
          id={patternId}
          className="relative size-full z-0 falling-pattern-bg"
          style={{
            backgroundColor,
            backgroundSize: backgroundSizes,
            animationDuration: `${duration}s`,
            animationDelay,
          }}
        />
      </motion.div>
      <div
        className="absolute inset-0 z-[1] dark:brightness-[6.0]"
        style={{
          backdropFilter: `blur(${blurIntensity})`,
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, ${backgroundColor} 2px)`,
          backgroundSize: `${8 * density}px ${8 * density}px`,
        }}
      />
    </div>
  );
}

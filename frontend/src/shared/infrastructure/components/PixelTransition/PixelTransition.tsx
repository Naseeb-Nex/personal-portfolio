import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface PixelTransitionProps {
  children?: React.ReactNode;
}

export const PixelTransition: React.FC<PixelTransitionProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let blocks: { x: number; y: number; w: number; h: number; sortKey: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 300; // 300px gives enough room for vertical growth
      
      const baseSize = Math.max(canvas.width / 40, 20); // Base pixel size
      
      const cols = Math.ceil(canvas.width / baseSize);
      const rows = Math.ceil(canvas.height / baseSize);
      const used = Array.from({ length: rows }, () => new Array(cols).fill(false));
      
      blocks = [];
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (used[y][x]) continue;

          // Random block sizes: 1x1, 2x2, 3x3, 2x1, 1x2
          let maxW = 1;
          let maxH = 1;
          const r = Math.random();
          if (r > 0.95 && x + 2 < cols && y + 2 < rows) {
            maxW = 3; maxH = 3;
          } else if (r > 0.8 && x + 1 < cols && y + 1 < rows) {
            maxW = 2; maxH = 2;
          } else if (r > 0.7 && x + 1 < cols) {
            maxW = 2; maxH = 1;
          } else if (r > 0.6 && y + 1 < rows) {
            maxW = 1; maxH = 2;
          }

          // Check if chosen area is free
          let canFit = true;
          for (let dy = 0; dy < maxH; dy++) {
            for (let dx = 0; dx < maxW; dx++) {
              if (used[y + dy][x + dx]) {
                canFit = false;
                break;
              }
            }
          }

          if (!canFit) {
            maxW = 1; maxH = 1;
          }

          // Mark used
          for (let dy = 0; dy < maxH; dy++) {
            for (let dx = 0; dx < maxW; dx++) {
              used[y + dy][x + dx] = true;
            }
          }

          const bottomY = (y + maxH) * baseSize;
          
          blocks.push({
            x: x * baseSize,
            y: y * baseSize,
            w: maxW * baseSize,
            h: maxH * baseSize,
            // Sort by bottom-most Y first (so largest Y is lowest sortKey)
            // Add some noise (0 to baseSize*1.5) for random jaggedness within a layer
            sortKey: -bottomY + (Math.random() * baseSize * 1.5)
          });
        }
      }

      // Sort so blocks at the bottom of the canvas are at the start of the array
      blocks.sort((a, b) => a.sortKey - b.sortKey);
        
      render(progressObj.value);
    };

    const progressObj = { value: 0 };

    const render = (progress: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // We start fully black (progress 0)
      // As progress -> 1, blocksToRemove increases, erasing black blocks starting from the bottom array index
      const blocksToRemove = Math.floor(progress * blocks.length);
      
      ctx.fillStyle = '#040100'; // Match Manifesto
      
      // Draw the remaining black blocks
      for (let i = blocksToRemove; i < blocks.length; i++) {
        const b = blocks[i];
        ctx.fillRect(b.x, b.y, b.w + 1, b.h + 1); // +1 to prevent gaps
      }
    };

    window.addEventListener('resize', resize);
    resize(); // Initial setup

    gsap.to(progressObj, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom', // Start animating when the transition enters the bottom of viewport
        end: 'bottom top', // Finish animating when transition reaches top of viewport
        scrub: true,
        onUpdate: () => {
          render(progressObj.value);
        }
      }
    });

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, { scope: containerRef });

  return (
    <>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '300px', 
          position: 'relative', 
          backgroundColor: '#F4F4F5', // Off-white to match AboutMe
          zIndex: 5,
          marginTop: '-1px' // connect cleanly to Manifesto
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none'
          }} 
        />
      </div>
      <div style={{ position: 'relative', zIndex: 6, backgroundColor: '#F4F4F5' }}>
        {children}
      </div>
    </>
  );
};

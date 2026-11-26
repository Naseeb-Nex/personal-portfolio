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
      
      // Fix block size to exactly 80x40 on all screens
      const blockWidth = 80;
      const blockHeight = 40;
      
      const cols = Math.ceil(canvas.width / blockWidth);
      const rows = Math.ceil(canvas.height / blockHeight);
      
      blocks = [];
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          
          const bottomY = (y + 1) * blockHeight;
          
          // "Advance pixels": some blocks get a lower sortKey so they turn white early
          let key = -bottomY;
          
          // Randomly push some blocks to appear "levels ahead" (disconnected islands)
          const advance = Math.random() > 0.6 
            ? (Math.random() * blockHeight * 4) 
            : (Math.random() * blockHeight);
          
          key -= advance;
          
          blocks.push({
            x: x * blockWidth,
            y: y * blockHeight,
            w: blockWidth,
            h: blockHeight,
            sortKey: key
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

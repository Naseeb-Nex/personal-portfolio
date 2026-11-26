import React, { useEffect, useRef } from 'react';
import { XylophoneScene } from '../lib/XylophoneScene';
import './Hero.css';

interface HeroProps {
  theme: 'dark' | 'light';
}

export const Hero: React.FC<HeroProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<XylophoneScene | null>(null);

  const initialThemeRef = useRef(theme);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const scene = new XylophoneScene({
      canvas: canvasRef.current,
      container: containerRef.current,
      initialTheme: initialThemeRef.current,
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setTheme(theme);
    }
  }, [theme]);

  return (
    <section className="hero-container" aria-label="Interactive 3D Glass Hero">
      <div ref={containerRef} className="hero-canvas-wrap" aria-hidden="true">
        <canvas ref={canvasRef} className="hero-canvas" />
      </div>
    </section>
  );
};

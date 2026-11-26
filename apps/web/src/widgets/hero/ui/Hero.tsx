import React, { useEffect, useRef } from 'react';
import { XylophoneScene } from '../lib/XylophoneScene';
import { HeroContent } from './HeroContent';
import { RobotFace } from './RobotFace';
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
    <section className="hero-container" aria-label="Interactive 3D Glass Hero with lilpix robot">
      {/* Background Xylophone WebGL canvas */}
      <div ref={containerRef} className="hero-canvas-wrap" aria-hidden="true">
        <canvas ref={canvasRef} className="hero-canvas" />
      </div>

      {/* Foreground Hero Layout */}
      <div className="hero-content-wrap">
        <div className="hero-left-col">
          <HeroContent />
        </div>
        <div className="hero-right-col">
          <RobotFace theme={theme} />
        </div>
      </div>
    </section>
  );
};

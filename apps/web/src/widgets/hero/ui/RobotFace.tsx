import React, { useEffect, useRef, useState } from 'react';
import { RobotScene, type ExpressionName } from '../lib/robot';
import './RobotFace.css';

interface RobotFaceProps {
  theme: 'dark' | 'light';
}

export const RobotFace: React.FC<RobotFaceProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<RobotScene | null>(null);
  const [expression, setExpression] = useState<ExpressionName>('neutral');

  const initialThemeRef = useRef(theme);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const scene = new RobotScene({
      canvas: canvasRef.current,
      container: containerRef.current,
      initialTheme: initialThemeRef.current,
      onExpressionChange: (name) => setExpression(name),
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      sceneRef.current?.nextExpression();
    }
  };

  return (
    <div
      ref={containerRef}
      className="hero-robot-wrapper"
      role="button"
      tabIndex={0}
      aria-label={`Interactive lilpix 3D robot face, expression: ${expression}. Click or press Enter to change expression.`}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} className="hero-robot-canvas" />
      <div className="hero-robot-badge" aria-hidden="true">
        <span className="hero-robot-pulse" />
        <span className="hero-robot-expression">{expression}</span>
      </div>
    </div>
  );
};

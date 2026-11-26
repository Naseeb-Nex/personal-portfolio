import React, { useEffect, useRef, useState, useCallback } from "react";
import { PixelBrain, type BrainSnapshot } from "./brain";
import { Pixel3DBot } from "./Pixel3DBot";
import { Pixel2DBot } from "./Pixel2DBot";
import {
  resolvePixelMode,
  persistPixelMode,
  type PixelMode,
} from "./mode";
import "./PixelCompanion.css";

export const PixelCompanion: React.FC = () => {
  const brainRef = useRef<PixelBrain | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<PixelMode>(() => resolvePixelMode());
  const [snapshot, setSnapshot] = useState<BrainSnapshot | null>(null);

  // Initialize brain on mount
  useEffect(() => {
    if (mode === "off") return;

    const brain = new PixelBrain();
    brainRef.current = brain;
    (window as unknown as { __pixelBrain?: PixelBrain }).__pixelBrain = brain;

    const unsubscribe = brain.subscribe((snap) => {
      setSnapshot(snap);
    });

    // Scan for DOM targets initially and on content loads
    const timer = setTimeout(() => {
      brain.scanDomElements();
    }, 500);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      brain.destroy();
      delete (window as unknown as { __pixelBrain?: PixelBrain }).__pixelBrain;
    };
  }, [mode]);

  const handleDegradedPerformance = useCallback(() => {
    setMode("2d");
    persistPixelMode("2d");
  }, []);

  const handleClick = () => {
    brainRef.current?.handleClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  if (mode === "off") return null;

  const expression = snapshot?.expression || "neutral";
  const reducedMotion = snapshot?.reducedMotion || false;
  const speechText = snapshot?.speechText;
  const targetPos = snapshot?.targetPos || { x: 20, y: 120 };

  return (
    <div
      ref={containerRef}
      className={`pixel-companion-container ${reducedMotion ? "reduced-motion" : ""}`}
      style={{
        transform: `translate3d(${targetPos.x}px, ${targetPos.y}px, 0)`,
      }}
      aria-label="Pixel Companion"
    >
      {/* Speech / Reaction Bubble */}
      {speechText && (
        <div
          className="pixel-speech-bubble"
          role="status"
          aria-live="polite"
        >
          {speechText}
        </div>
      )}

      {/* Interactive Hit Box */}
      <button
        type="button"
        className="pixel-companion-hitbox"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Pixel Companion (${snapshot?.state || "IDLE"}, feeling ${expression}). Click to interact.`}
        title="Pixel Companion - Click to interact"
      >
        {mode === "3d" ? (
          <Pixel3DBot
            expression={expression}
            onPerformanceDegraded={handleDegradedPerformance}
          />
        ) : (
          <Pixel2DBot
            expression={expression}
            reducedMotion={reducedMotion}
          />
        )}
      </button>
    </div>
  );
};

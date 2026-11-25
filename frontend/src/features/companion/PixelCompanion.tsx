import React, { useEffect, useRef, useState, useCallback } from "react";
import { PixelBrain, type BrainSnapshot } from "./brain";
import { Pixel3DBot } from "./Pixel3DBot";
import { Pixel2DBot } from "./Pixel2DBot";
import {
  resolvePixelMode,
  persistPixelMode,
  isPrefersReducedMotion,
  type PixelMode,
} from "./mode";
import "./PixelCompanion.css";

export const PixelCompanion: React.FC = () => {
  const brainRef = useRef<PixelBrain | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 20, y: 120 });

  const [mode, setMode] = useState<PixelMode>(() => resolvePixelMode());
  const [snapshot, setSnapshot] = useState<BrainSnapshot | null>(null);
  const animFrameRef = useRef<number>(0);

  // Initialize brain on mount
  useEffect(() => {
    if (mode === "off") return;

    const brain = new PixelBrain();
    brainRef.current = brain;

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
    };
  }, [mode]);

  // Spring animation loop for smooth translation
  useEffect(() => {
    if (mode === "off" || !snapshot) return;

    const reducedMotion = isPrefersReducedMotion();

    // If reduced motion is requested, snap position statically without roaming
    if (reducedMotion) {
      posRef.current = { ...snapshot.targetPos };
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${snapshot.targetPos.x}px, ${snapshot.targetPos.y}px, 0)`;
      }
      return;
    }

    let running = true;

    const loop = () => {
      if (!running) return;

      const target = brainRef.current?.getSnapshot().targetPos || posRef.current;
      const dx = target.x - posRef.current.x;
      const dy = target.y - posRef.current.y;

      // Spring damping: ~0.08 per frame for gentle organic floating
      posRef.current.x += dx * 0.08;
      posRef.current.y += dy * 0.08;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, snapshot]);

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

  return (
    <div
      ref={containerRef}
      className={`pixel-companion-container ${reducedMotion ? "reduced-motion" : ""}`}
      style={{
        transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
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

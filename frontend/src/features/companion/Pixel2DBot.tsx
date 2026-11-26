import React, { useEffect, useState } from "react";
import {
  type ExpressionName,
  eyeGrids,
  ledsFor,
  type Leds,
} from "./expressions";

interface Pixel2DBotProps {
  expression: ExpressionName;
  reducedMotion?: boolean;
}

export const Pixel2DBot: React.FC<Pixel2DBotProps> = ({
  expression,
  reducedMotion = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [ledTime, setLedTime] = useState(0);

  // Blink interval
  useEffect(() => {
    if (reducedMotion) return;
    let timeoutId: number;

    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const next = Math.random() * 4000 + 3000;
        timeoutId = window.setTimeout(triggerBlink, next);
      }, 140);
    };

    const initial = Math.random() * 3000 + 2000;
    timeoutId = window.setTimeout(triggerBlink, initial);

    return () => clearTimeout(timeoutId);
  }, [reducedMotion]);

  // LED animation timer
  useEffect(() => {
    let animId: number;
    const start = performance.now();

    const loop = (time: number) => {
      setLedTime((time - start) / 1000);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const grids = eyeGrids(expression, isBlinking);
  const leds: Leds = ledsFor(expression);

  // Calculate LED styling
  const renderLeds = () => {
    return [0, 1, 2].map((i) => {
      let color = leds.colors[i] || "#2a6bff";
      let opacity = 1;

      if (leds.mode === "rainbow") {
        const hue = ((ledTime * leds.speed + i / 3) % 1) * 360;
        color = `hsl(${hue}, 100%, 55%)`;
      } else if (leds.mode === "breathe") {
        const p = (Math.sin(ledTime * leds.speed * Math.PI * 2) + 1) / 2;
        opacity = 0.2 + 0.8 * (p * p);
      } else if (leds.mode === "blink") {
        opacity = Math.sin(ledTime * leds.speed * Math.PI * 2) > 0 ? 1 : 0.1;
      } else if (leds.mode === "chase") {
        const phase = (ledTime * leds.speed - i) % 3;
        opacity = Math.max(0.1, Math.exp(-Math.abs(phase) * 2.2));
      }

      return (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: color,
            opacity,
            boxShadow: `0 0 8px ${color}`,
            transition: "background-color 0.2s",
          }}
        />
      );
    });
  };

  const renderEye = (rows: string[]) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
          minWidth: 32,
          minHeight: 38,
        }}
      >
        {rows.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 2 }}>
            {row.split("").map((ch, c) => (
              <div
                key={c}
                style={{
                  width: 5.5,
                  height: 5.5,
                  borderRadius: 1.2,
                  backgroundColor: ch === "#" ? "#f8fafc" : "transparent",
                  boxShadow:
                    ch === "#"
                      ? "0 0 6px rgba(255, 255, 255, 0.9), 0 0 10px rgba(0, 229, 255, 0.4)"
                      : "none",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="pixel-2d-bot"
      style={{
        width: 140,
        height: 120,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 6px 18px rgba(0, 180, 255, 0.22))",
        userSelect: "none",
      }}
    >
      {/* Left Ear */}
      <div
        style={{
          position: "absolute",
          left: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: 8,
          height: 36,
          borderRadius: "4px 0 0 4px",
          background: "linear-gradient(to right, #242428, #18181c)",
          border: "1px solid #333338",
        }}
      />

      {/* Right Ear */}
      <div
        style={{
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: 8,
          height: 36,
          borderRadius: "0 4px 4px 0",
          background: "linear-gradient(to left, #242428, #18181c)",
          border: "1px solid #333338",
        }}
      />

      {/* Main Body */}
      <div
        style={{
          width: 122,
          height: 98,
          borderRadius: 22,
          background: "radial-gradient(circle at 50% 20%, #202024, #101013)",
          border: "1px solid #2e2e34",
          boxShadow:
            "inset 0 1px 2px rgba(255, 255, 255, 0.12), inset 0 -2px 6px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "6px 8px",
          position: "relative",
        }}
      >
        {/* Top LEDs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
            height: 12,
            marginBottom: 4,
          }}
        >
          {renderLeds()}
        </div>

        {/* Visor Screen */}
        <div
          style={{
            width: 104,
            height: 68,
            borderRadius: 14,
            backgroundColor: "#030304",
            border: "1px solid #1a1a20",
            boxShadow:
              "inset 0 2px 6px rgba(0, 0, 0, 0.9), 0 1px 1px rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle screen reflection gloss */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
              borderRadius: "14px 14px 0 0",
              pointerEvents: "none",
            }}
          />

          {/* Left and Right Eye Grids */}
          {renderEye(grids.left)}
          {renderEye(grids.right)}
        </div>
      </div>
    </div>
  );
};

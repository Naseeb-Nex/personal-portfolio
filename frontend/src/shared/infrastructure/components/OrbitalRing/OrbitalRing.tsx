import { useEffect, useState, useRef } from 'react';
import './OrbitalRing.css';

import pythonIcon from '../../../../assets/icons/python.svg';
import claudeIcon from '../../../../assets/icons/claude-ai-icon.svg';
import dockerIcon from '../../../../assets/icons/docker.svg';
import langchainIcon from '../../../../assets/icons/langchain-logo.svg';
import fastapiIcon from '../../../../assets/icons/fastapi.svg';
import githubIcon from '../../../../assets/icons/github_dark.svg';
import geminiIcon from '../../../../assets/icons/gemini.svg';
import huggingfaceIcon from '../../../../assets/icons/hugging_face.svg';
import langgraphIcon from '../../../../assets/icons/langgraph.svg';
import claudecodeIcon from '../../../../assets/icons/claude-code-color.svg';

const technologies = [
  { name: 'Python', icon: pythonIcon },
  { name: 'Claude', icon: claudeIcon },
  { name: 'Docker', icon: dockerIcon },
  { name: 'LangChain', icon: langchainIcon },
  { name: 'FastAPI', icon: fastapiIcon },
  { name: 'GitHub', icon: githubIcon },
  { name: 'Gemini', icon: geminiIcon },
  { name: 'Hugging Face', icon: huggingfaceIcon },
  { name: 'LangGraph', icon: langgraphIcon },
  { name: 'Claude Code', icon: claudecodeIcon },
];

// Orbit plane aligned with hero head's upper-left gaze direction.
// Head faces upper-left (~45° yaw, ~30° pitch up).
// TILT_X_DEG: pitch tilt (105 = front edge goes up, looking from below)
// TILT_Z_DEG: yaw skew (18 = leans leftward to match head)
const TILT_X_DEG = 105;   
const TILT_Z_DEG = 18;  
const R = 160;            // orbit radius in px

function project3D(angle: number, tiltXDeg: number, tiltZDeg: number) {
  const tiltXRad = tiltXDeg * (Math.PI / 180);
  const tiltZRad = tiltZDeg * (Math.PI / 180);

  // Point on flat circle (XY plane)
  const x0 = R * Math.cos(angle);
  const y0 = R * Math.sin(angle);
  const z0 = 0;

  // Step 1 — rotateX (tilt ring plane toward viewer)
  const x1 = x0;
  const y1 = y0 * Math.cos(tiltXRad) - z0 * Math.sin(tiltXRad);
  const z1 = y0 * Math.sin(tiltXRad) + z0 * Math.cos(tiltXRad);

  // Step 2 — rotateZ (skew ring leftward to match head gaze direction)
  const x2 = x1 * Math.cos(tiltZRad) - y1 * Math.sin(tiltZRad);
  const y2 = x1 * Math.sin(tiltZRad) + y1 * Math.cos(tiltZRad);
  const z2 = z1;

  return { x: x2, y: y2, z: z2 };
}

export default function OrbitalRing() {
  const [angle, setAngle] = useState(0);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        setAngle((prev) => (prev + 0.004) % (2 * Math.PI));
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Compute ellipse semi-axes from the combined tilt for SVG ring
  const tiltXRad = TILT_X_DEG * (Math.PI / 180);
  const ellipseRx = R;
  const ellipseRy = R * Math.cos(tiltXRad); // compressed vertical axis from rotateX

  // SVG canvas size — needs extra room for the rotateZ skew
  const svgPad = 60;
  const svgW = R * 2 + svgPad;
  const svgH = Math.abs(ellipseRy) * 2 + svgPad;
  const cx = R + svgPad / 2;
  const cy = Math.abs(ellipseRy) + svgPad / 2;

  // The skew angle in degrees for SVG transform
  const rotateDeg = TILT_Z_DEG; // applied as CSS rotate on SVG

  return (
    <div className="orbital-ring-container">
      {/* Front arc ONLY — back half is completely hidden (3D depth: only viewer-side visible) */}
      <svg
        className="orbital-ring-svg"
        width={svgW}
        height={svgH}
        style={{
          zIndex: 11,
          transform: `translate(-50%, -50%) rotate(${rotateDeg}deg)`,
        }}
      >
        <defs>
          <linearGradient id="frontDepthGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="20%"  stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0.7" />
          </linearGradient>
          <mask id="frontArcMask" maskUnits="userSpaceOnUse" x="0" y="0" width={svgW} height={svgH}>
            {/* Mask covers top half only (y=0 → cy) */}
            <rect x="0" y="0" width={svgW} height={cy} fill="url(#frontDepthGrad)" />
          </mask>
          {/* Clip: show top half of ellipse only — back (bottom half) arc fully hidden */}
          <clipPath id="frontHalfClip">
            <rect x="0" y="0" width={svgW} height={cy} />
          </clipPath>
        </defs>
        <ellipse
          cx={cx}
          cy={cy}
          rx={ellipseRx}
          ry={Math.abs(ellipseRy)}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          clipPath="url(#frontHalfClip)"
          mask="url(#frontArcMask)"
        />
      </svg>

      {/* Rotating Icons — use combined rotateX + rotateZ projection */}
      {technologies.map((tech, index) => {
        const itemAngle = angle + (index / technologies.length) * 2 * Math.PI;
        const { x, y, z } = project3D(itemAngle, TILT_X_DEG, TILT_Z_DEG);

        // z > 0 → front (toward viewer), z < 0 → back (away)
        const normalizedDepth = (z / R + 1) / 2; // 0 → 1

        const scale = 0.7 + 0.5 * normalizedDepth;    // 0.7 → 1.2
        const opacity = 0.15 + 0.85 * normalizedDepth; // 0.15 → 1.0
        const blur = (1 - normalizedDepth) * 2;

        const isFront = z > 0;
        const zIndex = isFront ? 12 : 8;

        return (
          <div
            key={tech.name}
            className={`orbital-icon-wrapper ${isFront ? 'front' : 'back'}`}
            style={{
              transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`,
              opacity,
              filter: blur > 0.3 ? `blur(${blur}px)` : 'none',
              zIndex,
            }}
          >
            <div className="orbital-icon-bg">
              <img src={tech.icon} alt={tech.name} className="orbital-icon-img" />
            </div>
            <span className="orbital-tooltip">{tech.name}</span>
          </div>
        );
      })}
    </div>
  );
}

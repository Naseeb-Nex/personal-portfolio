import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  type ExpressionName,
  eyeGrids,
  ledsFor,
  ledLevel,
  type Leds,
} from "./expressions";

interface Pixel3DBotProps {
  expression: ExpressionName;
  onPerformanceDegraded?: () => void;
  onStatsUpdate?: (stats: { fps: number; frameTimeMs: number; dpr: number }) => void;
}

const MAX_PIXELS = 96;
const PIXEL_SIZE = 0.58;
const PIXEL_STEP = 0.84;
const EYES_X = [-2.6, 2.6];
const EYES_Y = -0.6;
const FRONT_Z = 5.2;

const SLOTS_X = [-3.8, 0, 3.8];
const LED_Y = 5.6;
const LED_Z = 4.8;

const DUMMY = new THREE.Object3D();

export const Pixel3DBot: React.FC<Pixel3DBotProps> = ({
  expression,
  onPerformanceDegraded,
  onStatsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const expressionRef = useRef<ExpressionName>(expression);
  const updateEyesRef = useRef<((expr: ExpressionName, blinking: boolean) => void) | null>(null);

  useEffect(() => {
    expressionRef.current = expression;
    updateEyesRef.current?.(expression, false);
  }, [expression]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Renderer & Scene
    const width = 160;
    const height = 160;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      onPerformanceDegraded?.();
      return;
    }

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 28);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xe2f1ff, 2.2);
    dirLight1.position.set(6, 12, 16);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x406080, 0.8);
    dirLight2.position.set(-8, -6, -10);
    scene.add(dirLight2);

    // 3. Bot Group & Meshes
    const botGroup = new THREE.Group();
    scene.add(botGroup);

    // Body: Graphite glass rounded box
    const bodyGeometry = new RoundedBoxGeometry(15, 11.5, 9.5, 3, 2.0);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x121214,
      roughness: 0.35,
      metalness: 0.25,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    botGroup.add(bodyMesh);

    // Front Screen Bezel (deep glossy black)
    const bezelGeometry = new RoundedBoxGeometry(11.8, 8.2, 0.4, 2, 0.8);
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: 0x020202,
      roughness: 0.15,
      metalness: 0.4,
    });
    const bezelMesh = new THREE.Mesh(bezelGeometry, bezelMaterial);
    bezelMesh.position.set(0, -0.6, 4.65);
    botGroup.add(bezelMesh);

    // Ears / Side cylinders
    const earGeometry = new THREE.CylinderGeometry(1.6, 1.6, 0.8, 16);
    const earMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d1d20,
      roughness: 0.5,
    });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-7.8, 0, 0);
    botGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.position.set(7.8, 0, 0);
    botGroup.add(rightEar);

    // 4. Instanced Eye Pixels
    const eyeGeometry = new THREE.PlaneGeometry(PIXEL_SIZE, PIXEL_SIZE);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xecf2f8,
      toneMapped: false,
    });
    const eyeMesh = new THREE.InstancedMesh(eyeGeometry, eyeMaterial, MAX_PIXELS);
    eyeMesh.position.set(0, 0, FRONT_Z);
    botGroup.add(eyeMesh);

    // 5. LED Array (3 lenses on top)
    const ledGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 16);
    const ledMaterials: THREE.MeshStandardMaterial[] = [];
    SLOTS_X.forEach((x) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x222224,
        emissive: new THREE.Color(0x00ff88),
        emissiveIntensity: 1.0,
        roughness: 0.2,
      });
      ledMaterials.push(mat);
      const ledMesh = new THREE.Mesh(ledGeometry, mat);
      ledMesh.position.set(x, LED_Y, LED_Z);
      botGroup.add(ledMesh);
    });

    // 6. Animation, Cursor Gaze & Blink state
    let targetGazeX = 0;
    let targetGazeY = 0;
    let currentGazeX = 0;
    let currentGazeY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      targetGazeX = Math.max(-1, Math.min(1, dx));
      targetGazeY = Math.max(-1, Math.min(1, -dy));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Blink timer
    let isBlinking = false;
    let nextBlinkTime = performance.now() + 3500;
    let blinkEndTime = 0;

    // Helper to update instanced eye pixels
    const updateEyes = (expr: ExpressionName, blinking: boolean) => {
      const grids = eyeGrids(expr, blinking);
      let count = 0;

      [grids.left, grids.right].forEach((rows, eyeIndex) => {
        const h = rows.length;
        const w = rows[0]?.length || 0;
        const originX = EYES_X[eyeIndex] - ((w - 1) * PIXEL_STEP) / 2;
        const originY = EYES_Y + ((h - 1) * PIXEL_STEP) / 2;

        rows.forEach((row, r) => {
          for (let c = 0; c < row.length; c++) {
            if (row[c] === "#" && count < MAX_PIXELS) {
              DUMMY.position.set(
                originX + c * PIXEL_STEP,
                originY - r * PIXEL_STEP,
                0.01
              );
              DUMMY.updateMatrix();
              eyeMesh.setMatrixAt(count, DUMMY.matrix);
              count++;
            }
          }
        });
      });

      eyeMesh.count = count;
      eyeMesh.instanceMatrix.needsUpdate = true;
    };

    updateEyes(expressionRef.current, false);
    updateEyesRef.current = updateEyes;

    // 7. Render Loop with Delta Clamping & Adaptive DPR Monitor
    let lastTime = performance.now();
    let animId = 0;
    let lowFpsDuration = 0;
    let frameCounter = 0;
    let fpsTimer = performance.now();

    const scratchColor = new THREE.Color();

    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      // Delta clamp 1/30 to prevent jumps
      let delta = (time - lastTime) / 1000;
      lastTime = time;
      if (delta > 0.0333) delta = 0.0333;
      const frameTimeMs = delta * 1000;

      // FPS tracking & Adaptive DPR monitor
      frameCounter++;
      if (time - fpsTimer >= 1000) {
        const fps = Math.round((frameCounter * 1000) / (time - fpsTimer));
        onStatsUpdate?.({ fps, frameTimeMs, dpr });
        frameCounter = 0;
        fpsTimer = time;
      }

      // Check if performance is poor (>45ms / <22fps)
      if (frameTimeMs > 45) {
        lowFpsDuration += delta;
        if (lowFpsDuration > 3.0) {
          // Sustained poor performance for 3 seconds -> degrade to 2D
          onPerformanceDegraded?.();
          return;
        }
      } else {
        lowFpsDuration = Math.max(0, lowFpsDuration - delta * 0.5);
      }

      // Blink handling
      if (!isBlinking && time >= nextBlinkTime) {
        isBlinking = true;
        blinkEndTime = time + 140; // 140ms blink
        updateEyes(expressionRef.current, true);
      } else if (isBlinking && time >= blinkEndTime) {
        isBlinking = false;
        nextBlinkTime = time + Math.random() * 4000 + 3000;
        updateEyes(expressionRef.current, false);
      }

      // Gaze dampening
      currentGazeX = THREE.MathUtils.damp(currentGazeX, targetGazeX, 8, delta);
      currentGazeY = THREE.MathUtils.damp(currentGazeY, targetGazeY, 8, delta);

      // Bot wobble / float
      const wobbleY = Math.sin(time * 0.0022) * 0.35;
      const wobbleRotZ = Math.sin(time * 0.0016) * 0.025;
      botGroup.position.y = wobbleY;
      botGroup.rotation.y = currentGazeX * 0.35;
      botGroup.rotation.x = -currentGazeY * 0.22;
      botGroup.rotation.z = wobbleRotZ;

      // Eye pupil travel
      eyeMesh.position.x = currentGazeX * 0.5;
      eyeMesh.position.y = currentGazeY * 0.35;

      // LED animations
      const leds: Leds = ledsFor(expressionRef.current);
      const tSeconds = time / 1000;

      ledMaterials.forEach((mat, i) => {
        if (leds.mode === "rainbow") {
          scratchColor.setHSL((tSeconds * leds.speed + i / 3) % 1, 0.95, 0.5);
        } else {
          scratchColor.set(leds.colors[i] || "#2a6bff");
        }
        const level = ledLevel(leds, tSeconds, i);
        mat.emissive.copy(scratchColor);
        mat.emissiveIntensity = level * 1.8;
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      bezelGeometry.dispose();
      bezelMaterial.dispose();
      earGeometry.dispose();
      earMaterial.dispose();
      eyeGeometry.dispose();
      eyeMaterial.dispose();
      ledGeometry.dispose();
      ledMaterials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [onPerformanceDegraded, onStatsUpdate]);

  // Expression changes triggered externally
  useEffect(() => {
    // Canvas eye update is synced in next tick or instant
  }, [expression]);

  return (
    <div
      ref={containerRef}
      className="pixel-3d-bot"
      style={{
        width: 160,
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 6px 16px rgba(0, 180, 255, 0.25))",
      }}
    >
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        style={{
          width: 160,
          height: 160,
          display: "block",
        }}
      />
    </div>
  );
};

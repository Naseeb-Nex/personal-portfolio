/**
 * lilpix 3D Robot Scene Manager (Pure Three.js)
 *
 * Adapted from lilpix (https://github.com/0xdhrv/lilpix / https://lilpix.dhrv.pw/)
 * Original work Copyright (c) 2026 Dhruv Suthar
 * Licensed under the MIT License:
 * https://github.com/0xdhrv/lilpix/blob/main/LICENSE
 */

import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  EXPRESSION_NAMES,
  eyeGrids,
  ledsFor,
  type ExpressionName,
  type Leds,
} from './expressions';

const DEPTH = 12;
const FRONT = DEPTH / 2; // 6
const INK = '#000000';
const EYE = '#f2f2f2';

const SLOTS = [-6.16, -3.5, -0.88];
const EYES = [-2.58, 2.65];
const PIXEL = 0.86;
const EYES_Y = -0.95;

const EAR_HX = 17.7 / 2;
const VENTS = Array.from({ length: 11 }, (_, i) => (i - 5) * 0.73);

// Rotation clamps: +/-35 deg yaw (~0.6109 rad), +/-25 deg pitch (~0.4363 rad)
const MAX_YAW = (35 * Math.PI) / 180;
const MAX_PITCH = (25 * Math.PI) / 180;

// Eye travel limits inside screen boundary
const LOOK_X = 1.0;
const LOOK_Y = 0.65;

const MAX_PIXELS = 96;
const LED_GLOW = 2.4;

const FIT_WIDTH = 42;
const FIT_HEIGHT = 38;
const VIEW = new Vector3(16, 9, 44).normalize();

export interface RobotSceneOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  initialTheme?: 'dark' | 'light';
  onExpressionChange?: (name: ExpressionName) => void;
}

export class RobotScene {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private theme: 'dark' | 'light';
  private onExpressionChange?: (name: ExpressionName) => void;

  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private ambientLight: AmbientLight;
  private keyLight: DirectionalLight;
  private fillLight: DirectionalLight;

  private bodyGroup: Group;
  private eyesGroup: Group;
  private eyeMesh: InstancedMesh;
  private ledMaterials: MeshStandardMaterial[] = [];
  private dummy: Object3D;

  private currentExpression: ExpressionName = 'neutral';
  private expressionIndex = 0;

  // Smoothing & tracking state
  public currentTurn = { x: 0, y: 0 };
  public targetTurn = { x: 0, y: 0 };
  public currentLook = { x: 0, y: 0 };
  public targetLook = { x: 0, y: 0 };

  private lastPointerPos: { x: number; y: number } | null = null;
  private lastPointerTime = performance.now();
  private lastTime = performance.now();
  private animationFrameId = 0;
  private isDisposed = false;
  private isPaused = false;
  private prefersReducedMotion = false;
  private resizeObserver?: ResizeObserver;

  private scratchColor = new Color();

  constructor(options: RobotSceneOptions) {
    this.canvas = options.canvas;
    this.container = options.container;
    this.theme = options.initialTheme ?? 'dark';
    this.onExpressionChange = options.onExpressionChange;

    this.checkReducedMotion();

    // Scene
    this.scene = new Scene();

    // Camera
    this.camera = new PerspectiveCamera(35, 1, 0.1, 1000);
    this.updateCameraFit();

    // Renderer (transparent background so xylophone scene shows behind)
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Lights
    this.ambientLight = new AmbientLight(0xffffff, this.theme === 'dark' ? 0.35 : 0.6);
    this.scene.add(this.ambientLight);

    this.keyLight = new DirectionalLight(0xffffff, this.theme === 'dark' ? 1.6 : 2.0);
    this.keyLight.position.set(10, 18, 14);
    this.scene.add(this.keyLight);

    this.fillLight = new DirectionalLight(0xd4e2ff, this.theme === 'dark' ? 0.6 : 0.8);
    this.fillLight.position.set(-12, -4, 10);
    this.scene.add(this.fillLight);

    // Dummy for instancing
    this.dummy = new Object3D();

    // Robot assembly
    this.bodyGroup = new Group();
    this.eyesGroup = new Group();

    // Meshes
    this.createBodyMeshes();
    this.eyeMesh = this.createEyePixels();
    this.eyesGroup.add(this.eyeMesh);
    this.eyesGroup.position.set(0, EYES_Y, FRONT + 0.12);
    this.bodyGroup.add(this.eyesGroup);

    this.createLeds();

    this.scene.add(this.bodyGroup);

    // Initial expression (square eyes)
    this.setExpression('neutral');

    // Events & Observers
    this.bindEvents();
    this.onResize();

    // Expose test hook for verification in Playwright
    if (typeof window !== 'undefined') {
      (window as unknown as { __HERO_ROBOT__: unknown }).__HERO_ROBOT__ = {
        getTurn: () => ({ ...this.currentTurn }),
        getTargetTurn: () => ({ ...this.targetTurn }),
        getLook: () => ({ ...this.currentLook }),
        getTargetLook: () => ({ ...this.targetLook }),
        getExpression: () => this.currentExpression,
        nextExpression: () => this.nextExpression(),
      };
    }

    // Loop
    this.animate = this.animate.bind(this);
    this.animate(performance.now());
  }

  private checkReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  private createBodyMeshes() {
    const shellMaterial = new MeshStandardMaterial({
      color: 0x2d2c2d,
      roughness: 0.55,
      metalness: 0.1,
    });

    // Main body box (15.8 x 15.8 square face)
    const bodyGeometry = new RoundedBoxGeometry(15.8, 15.8, DEPTH, 4, 0.25);
    const bodyMesh = new Mesh(bodyGeometry, shellMaterial);
    this.bodyGroup.add(bodyMesh);

    // Ears / wings box
    const earsGeometry = new RoundedBoxGeometry(17.7, 14, DEPTH - 1, 4, 0.25);
    const earsMesh = new Mesh(earsGeometry, shellMaterial);
    this.bodyGroup.add(earsMesh);

    // Ear vents (left and right)
    const ventGeometry = new BoxGeometry(0.04, 6.7, 0.3);
    const ventMaterial = new MeshStandardMaterial({ color: INK, roughness: 0.9 });

    VENTS.forEach((z) => {
      const rightVent = new Mesh(ventGeometry, ventMaterial);
      rightVent.position.set(EAR_HX + 0.005, 0, z);
      this.bodyGroup.add(rightVent);

      const leftVent = new Mesh(ventGeometry, ventMaterial);
      leftVent.position.set(-EAR_HX - 0.005, 0, z);
      this.bodyGroup.add(leftVent);
    });

    // Screen face
    const screenGeometry = new BoxGeometry(14.2, 9.8, 0.1);
    const screenMaterial = new MeshPhysicalMaterial({
      color: INK,
      roughness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    const screenMesh = new Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0, -1.4, FRONT + 0.01);
    this.bodyGroup.add(screenMesh);
  }

  private createEyePixels(): InstancedMesh {
    const pixelGeometry = new PlaneGeometry(PIXEL, PIXEL).translate(0, 0, 0.06);
    const pixelMaterial = new MeshBasicMaterial({
      color: EYE,
      toneMapped: false,
    });
    pixelMaterial.color.multiplyScalar(1.25);

    const instanced = new InstancedMesh(pixelGeometry, pixelMaterial, MAX_PIXELS);
    instanced.frustumCulled = false;
    return instanced;
  }

  private createLeds() {
    const bezelGeometry = new BoxGeometry(1.75, 1.75, 0.1);
    const bezelMaterial = new MeshStandardMaterial({ color: INK, roughness: 0.4 });
    const lensGeometry = new BoxGeometry(1.1, 1.1, 0.06);

    SLOTS.forEach((x, i) => {
      const bezel = new Mesh(bezelGeometry, bezelMaterial);
      bezel.position.set(x, 6.2, FRONT + 0.01);
      this.bodyGroup.add(bezel);

      const lensMaterial = new MeshStandardMaterial({
        color: INK,
        roughness: 0.2,
        toneMapped: false,
      });
      const lens = new Mesh(lensGeometry, lensMaterial);
      lens.position.set(x, 6.2, FRONT + 0.08);
      this.bodyGroup.add(lens);
      this.ledMaterials[i] = lensMaterial;
    });
  }

  public setExpression(name: ExpressionName) {
    this.currentExpression = name;
    this.expressionIndex = EXPRESSION_NAMES.indexOf(name);
    const [left, right] = eyeGrids(name);

    let count = 0;
    [left, right].forEach((rows, eye) => {
      const h = rows.length;
      const w = rows[0].length;
      rows.forEach((row, r) => {
        row.split('').forEach((cell, c) => {
          if (cell !== '#' || count >= MAX_PIXELS) return;
          this.dummy.position.set(
            EYES[eye] + (c - (w - 1) / 2) * PIXEL,
            ((h - 1) / 2 - r) * PIXEL,
            0
          );
          this.dummy.updateMatrix();
          this.eyeMesh.setMatrixAt(count++, this.dummy.matrix);
        });
      });
    });

    this.eyeMesh.count = count;
    this.eyeMesh.instanceMatrix.needsUpdate = true;

    // Squint animation on expression change
    this.eyesGroup.scale.y = 0.05;

    if (this.onExpressionChange) {
      this.onExpressionChange(name);
    }
  }

  public nextExpression() {
    const nextIdx = (this.expressionIndex + 1) % EXPRESSION_NAMES.length;
    this.setExpression(EXPRESSION_NAMES[nextIdx]);
  }

  public getExpression(): ExpressionName {
    return this.currentExpression;
  }

  public setTheme(theme: 'dark' | 'light') {
    this.theme = theme;
    this.ambientLight.intensity = theme === 'dark' ? 0.35 : 0.6;
    this.keyLight.intensity = theme === 'dark' ? 1.6 : 2.0;
    this.fillLight.intensity = theme === 'dark' ? 0.6 : 0.8;
  }

  private updateCameraFit(forcedWidth?: number, forcedHeight?: number) {
    const width = forcedWidth ?? this.container.clientWidth ?? 400;
    const height = forcedHeight ?? this.container.clientHeight ?? 400;
    const aspect = width / (height || 1);

    const halfV = MathUtils.degToRad(this.camera.fov) / 2;
    const halfH = Math.atan(Math.tan(halfV) * aspect);
    const distance = Math.max(FIT_HEIGHT / 2 / Math.tan(halfV), FIT_WIDTH / 2 / Math.tan(halfH));

    this.camera.position.copy(VIEW).multiplyScalar(distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Convert client coordinates to normalized coordinates relative to
   * the robot canvas on-screen center, working on full window and while scrolled.
   */
  private updatePointerTarget(clientX: number, clientY: number) {
    if (this.prefersReducedMotion) return;

    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const spanX = Math.max(centerX, window.innerWidth - centerX) || (window.innerWidth / 2);
    const spanY = Math.max(centerY, window.innerHeight - centerY) || (window.innerHeight / 2);

    const normX = MathUtils.clamp((clientX - centerX) / spanX, -1, 1);
    const normY = MathUtils.clamp((centerY - clientY) / spanY, -1, 1); // positive pointing up

    // Clamped head rotation: yaw +/-35 deg, pitch +/-25 deg
    this.targetTurn.y = normX * MAX_YAW;
    this.targetTurn.x = -normY * MAX_PITCH;

    // Small eye offset following cursor within screen face
    this.targetLook.x = normX * LOOK_X;
    this.targetLook.y = normY * LOOK_Y;

    this.lastPointerPos = { x: clientX, y: clientY };
    this.lastPointerTime = performance.now();
  }

  private onWindowPointerMove = (e: PointerEvent) => {
    this.updatePointerTarget(e.clientX, e.clientY);
  };

  private onWindowPointerDown = (e: PointerEvent) => {
    this.updatePointerTarget(e.clientX, e.clientY);
  };

  private onScroll = () => {
    if (this.lastPointerPos) {
      this.updatePointerTarget(this.lastPointerPos.x, this.lastPointerPos.y);
    }
  };

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.isPaused = true;
    } else {
      this.isPaused = false;
      this.lastTime = performance.now();
      if (!this.animationFrameId) {
        this.animate(performance.now());
      }
    }
  };

  private onClick = () => {
    this.nextExpression();
  };

  private onResize = () => {
    if (this.isDisposed) return;
    const rect = this.container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(dpr);
    this.updateCameraFit(width, height);

    if (this.lastPointerPos) {
      this.updatePointerTarget(this.lastPointerPos.x, this.lastPointerPos.y);
    }
  };

  private bindEvents() {
    window.addEventListener('pointermove', this.onWindowPointerMove, { passive: true });
    window.addEventListener('pointerdown', this.onWindowPointerDown, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('resize', this.onResize, { passive: true });
    this.container.addEventListener('click', this.onClick);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.container);
    }
  }

  private unbindEvents() {
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerdown', this.onWindowPointerDown);
    window.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('resize', this.onResize);
    this.container.removeEventListener('click', this.onClick);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  private updateLeds(leds: Leds, t: number) {
    this.ledMaterials.forEach((material, i) => {
      let level = 1;
      if (leds.mode === 'breathe') {
        level = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin((t * leds.speed + i * 0.15) * Math.PI * 2));
      } else if (leds.mode === 'blink') {
        level = (t * leds.speed) % 1 < 0.5 ? 1 : 0.06;
      } else if (leds.mode === 'chase') {
        level = Math.floor(t * leds.speed) % 3 === i ? 1 : 0.1;
      }

      if (leds.mode === 'rainbow') {
        this.scratchColor.setHSL((t * leds.speed + i / 3) % 1, 1, 0.5);
      } else {
        this.scratchColor.set(leds.colors[i]);
      }

      material.emissive.copy(this.scratchColor);
      material.emissiveIntensity = LED_GLOW * level;
    });
  }

  private animate(now: number) {
    if (this.isDisposed || this.isPaused) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min((now - this.lastTime) / 1000, 1 / 30);
    this.lastTime = now;
    const t = now / 1000;

    // After ~3s without pointer activity, gently return to neutral
    if (now - this.lastPointerTime > 3000) {
      this.targetTurn.x = 0;
      this.targetTurn.y = 0;
      this.targetLook.x = 0;
      this.targetLook.y = 0;
    }

    // Blinking animation
    const blinking = t % 4 > 3.85;
    const targetOpenness = blinking ? 0.08 : 1.0;
    this.eyesGroup.scale.y = MathUtils.damp(this.eyesGroup.scale.y, targetOpenness, 18, delta);

    // Frame-rate independent exponential damping
    if (this.prefersReducedMotion) {
      this.eyesGroup.position.x = 0;
      this.eyesGroup.position.y = EYES_Y;
      this.bodyGroup.position.y = 0;
      this.bodyGroup.rotation.set(0, 0, 0);
    } else {
      // Damped pointer follow
      this.currentTurn.x = MathUtils.damp(this.currentTurn.x, this.targetTurn.x, 6, delta);
      this.currentTurn.y = MathUtils.damp(this.currentTurn.y, this.targetTurn.y, 6, delta);
      this.currentLook.x = MathUtils.damp(this.currentLook.x, this.targetLook.x, 10, delta);
      this.currentLook.y = MathUtils.damp(this.currentLook.y, this.targetLook.y, 10, delta);

      // Additive idle float & wobble
      const floatY = Math.sin(t * 2) * 0.35;
      const floatRotZ = Math.sin(t * 1.5) * 0.025;
      const idlePitch = Math.sin(t * 1.2) * 0.015;

      this.bodyGroup.position.y = floatY;
      this.bodyGroup.rotation.set(
        this.currentTurn.x + idlePitch,
        this.currentTurn.y,
        floatRotZ
      );

      this.eyesGroup.position.x = this.currentLook.x;
      this.eyesGroup.position.y = EYES_Y + this.currentLook.y;
    }

    // LEDs
    this.updateLeds(ledsFor(this.currentExpression), t);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animationFrameId);
    this.unbindEvents();

    if (typeof window !== 'undefined') {
      delete (window as unknown as { __HERO_ROBOT__?: unknown }).__HERO_ROBOT__;
    }

    this.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}

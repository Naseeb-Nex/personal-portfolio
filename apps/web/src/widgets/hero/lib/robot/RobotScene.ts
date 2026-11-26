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

const LOOK_X = 1.1;
const LOOK_Y = 0.75;
const TURN_Y = 0.3;
const TURN_X = 0.18;

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

  private look = { x: 0, y: 0 };
  private turn = { x: 0, y: 0 };
  private target = { x: 0, y: 0 };
  private lastTime = performance.now();
  private animationFrameId = 0;
  private isDisposed = false;
  private prefersReducedMotion = false;

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

    // Initial expression
    this.setExpression('neutral');

    // Events
    this.bindEvents();
    this.onResize();

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

    // Main body box
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

  private updateCameraFit() {
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 400;
    const aspect = width / height;

    const halfV = MathUtils.degToRad(this.camera.fov) / 2;
    const halfH = Math.atan(Math.tan(halfV) * aspect);
    const distance = Math.max(FIT_HEIGHT / 2 / Math.tan(halfV), FIT_WIDTH / 2 / Math.tan(halfH));

    this.camera.position.copy(VIEW).multiplyScalar(distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  private onPointerMove = (e: PointerEvent) => {
    if (this.prefersReducedMotion) return;
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    this.target.x = MathUtils.clamp(x, -1, 1);
    this.target.y = MathUtils.clamp(y, -1, 1);
  };

  private onPointerLeave = () => {
    this.target.x = 0;
    this.target.y = 0;
  };

  private onClick = () => {
    this.nextExpression();
  };

  private onResize = () => {
    if (this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(dpr);
    this.updateCameraFit();
  };

  private bindEvents() {
    this.container.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.container.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    this.container.addEventListener('click', this.onClick);
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  private unbindEvents() {
    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('pointerleave', this.onPointerLeave);
    this.container.removeEventListener('click', this.onClick);
    window.removeEventListener('resize', this.onResize);
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
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min((now - this.lastTime) / 1000, 1 / 30);
    this.lastTime = now;
    const t = now / 1000;

    // Blinking
    const blinking = t % 4 > 3.85;
    const targetOpenness = blinking ? 0.08 : 1.0;
    this.eyesGroup.scale.y = MathUtils.damp(this.eyesGroup.scale.y, targetOpenness, 18, delta);

    // Movement & Follow
    if (this.prefersReducedMotion) {
      this.eyesGroup.position.x = 0;
      this.eyesGroup.position.y = EYES_Y;
      this.bodyGroup.position.y = 0;
      this.bodyGroup.rotation.set(0, 0, 0);
    } else {
      this.look.x = MathUtils.damp(this.look.x, this.target.x, 8, delta);
      this.look.y = MathUtils.damp(this.look.y, this.target.y, 8, delta);
      this.eyesGroup.position.x = this.look.x * LOOK_X;
      this.eyesGroup.position.y = EYES_Y + this.look.y * LOOK_Y;

      this.turn.y = MathUtils.damp(this.turn.y, this.target.x * TURN_Y, 3, delta);
      this.turn.x = MathUtils.damp(this.turn.x, -this.target.y * TURN_X, 3, delta);

      // Subtle float
      const floatY = Math.sin(t * 2) * 0.35;
      const floatRotZ = Math.sin(t * 1.5) * 0.025;
      this.bodyGroup.position.y = floatY;
      this.bodyGroup.rotation.set(this.turn.x, this.turn.y, floatRotZ);
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

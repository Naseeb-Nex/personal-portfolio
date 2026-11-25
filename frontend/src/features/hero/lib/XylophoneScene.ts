/**
 * Xylophone 3D WebGL Scene manager.
 * Ported from Codrops WebGL Animated Glass Xylophone (MIT License).
 * Copyright (c) 2009 - 2026 Codrops (https://codrops.com)
 */
import {
  BufferGeometry,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  DoubleSide,
  Euler,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import modelUrl from "../../../assets/models/xylophone-09.glb?url";
import xylophoneFrag from "../shaders/xylophone/xylophoneFrag.glsl?raw";
import xylophoneVert from "../shaders/xylophone/xylophoneVert.glsl?raw";
import xylophoneBgFrag from "../shaders/xylophoneBg/xylophoneBgFrag.glsl?raw";
import xylophoneBgVert from "../shaders/xylophoneBg/xylophoneBgVert.glsl?raw";
import { FBOHelper } from "./FBOHelper";
import { FluidSim } from "./FluidSim";
import { buildInstancedGeometry, writeHelixTransforms, type BuiltGeometry, type HelixConfig } from "./helix";
import { createHitWorkspace, hitBarIndex, type InstanceAttributes } from "./picking";

export interface XylophoneSceneOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  initialTheme?: "dark" | "light";
}

const HELIX_CONFIG: HelixConfig = {
  count: 64,
  radius: 1,
  tiltFalloff: 2,
  thetaStep: 0.175,
  thetaOffset: Math.PI,
};

const XYLOPHONE_PROPS = {
  spinSpeed: 0.3,
  tintWrap: 10,
  group: { rotXDeg: 25, rotZDeg: 30 },
  scroll: { sensitivity: 0.005, lerp: 5 },
};

function buildGradientTexture(): Texture {
  const width = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0.0, "#ff0033");
  grad.addColorStop(0.3, "#ff00d4");
  grad.addColorStop(0.5, "#6a00ff");
  grad.addColorStop(0.8, "#0090ff");
  grad.addColorStop(1.0, "#00ffe1");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, 1);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  return tex;
}

export class XylophoneScene {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private bgScene: Scene;
  private bgCamera: OrthographicCamera;

  private fboHelper: FBOHelper;
  private fluidSim: FluidSim;
  private backdropTarget: WebGLRenderTarget;

  // Background
  private bgMesh: Mesh;
  private bgMaterial: ShaderMaterial;
  private mainBgMaterial: ShaderMaterial;
  private bgGeometry: PlaneGeometry;

  // Xylophone
  private xylophoneGroup: Group;
  private xylophoneMesh?: Mesh;
  private xylophoneMaterial?: ShaderMaterial;
  private instances?: BuiltGeometry;
  private hitInstances?: InstanceAttributes;
  private gradientTexture: Texture;
  private geometryHeight = 1;

  // Interaction & picking
  private raycaster = new Raycaster();
  private hitWorkspace = createHitWorkspace();
  private lastHitIndex = -1;
  private mouseXY = new Vector2(-1000, -1000);
  private mouseScreenXY = new Vector2(0.5, 0.5);
  private hasPointer = false;

  // Scroll phase
  private phaseTarget = 0;
  private phaseCurrent = 0;
  private phaseWritten = 0;
  private readonly tempEuler = new Euler(0, 0, 0, "YXZ");
  private readonly tempQuat = new Quaternion();

  // Animation & timing
  private rafId = 0;
  private lastTime = performance.now();
  private totalTime = 0;
  private isDisposed = false;
  private reduceMotion = false;
  private currentTheme: "dark" | "light" = "dark";

  // Uniforms
  private xylophoneUniforms = {
    u_time: { value: 0 },
    u_spinSpeed: { value: XYLOPHONE_PROPS.spinSpeed },
    u_swingScale: { value: 1.0 },
    u_swingAxis: { value: new Vector3(0, 1, 0) },
    u_tFluid: { value: null as Texture | null },
    u_tGradient: { value: null as Texture | null },
    u_fluidStrength: { value: 1.0 },
    u_tintStrength: { value: 1.0 },
    u_tintGlow: { value: 0.15 },
    u_tintWrap: { value: XYLOPHONE_PROPS.tintWrap },
    u_tBackdrop: { value: null as Texture | null },
    u_transmission: { value: 0.84 },
    u_refractStrength: { value: 0.2 },
    u_fresnelPower: { value: 3.0 },
    u_iridStrength: { value: 0.6 },
    u_iridCycles: { value: 3.0 },
    u_iridShift: { value: 0.0 },
    u_iridPower: { value: 2.5 },
    u_iridBody: { value: 0.12 },
  };

  private backdropBgUniforms = {
    u_color: { value: new Color(0xa391d3) },
    u_isDark: { value: 0 },
    u_debugPattern: { value: 0 },
  };

  private mainBgUniforms = {
    u_color: { value: new Color(0xa391d3) },
    u_isDark: { value: 1 },
    u_debugPattern: { value: 0 },
  };

  constructor(options: XylophoneSceneOptions) {
    this.canvas = options.canvas;
    this.container = options.container;
    this.currentTheme = options.initialTheme || "dark";

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    // Renderer
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);

    // Camera
    this.camera = new PerspectiveCamera(45, width / height, 0.1, 200);
    this.camera.position.set(0, 0, 5);

    // Helpers & passes
    this.fboHelper = new FBOHelper(this.renderer);
    this.fluidSim = new FluidSim(this.fboHelper);
    this.xylophoneUniforms.u_tFluid.value = this.fluidSim.uniforms.velocity.value;

    this.gradientTexture = buildGradientTexture();
    this.xylophoneUniforms.u_tGradient.value = this.gradientTexture;

    // Backdrop target
    this.backdropTarget = new WebGLRenderTarget(512, 512, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: false,
      colorSpace: SRGBColorSpace,
    });
    this.xylophoneUniforms.u_tBackdrop.value = this.backdropTarget.texture;

    // Background scene & mesh for backdrop reflection/transmission
    this.bgScene = new Scene();
    this.bgCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.bgGeometry = new PlaneGeometry(2, 2);
    this.bgMaterial = new ShaderMaterial({
      uniforms: this.backdropBgUniforms,
      vertexShader: xylophoneBgVert,
      fragmentShader: xylophoneBgFrag,
      side: DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    this.bgMesh = new Mesh(this.bgGeometry, this.bgMaterial);
    this.bgMesh.frustumCulled = false;
    this.bgScene.add(this.bgMesh);

    // Main scene
    this.scene = new Scene();
    // Add bg to main scene as well (behind bars)
    this.mainBgMaterial = new ShaderMaterial({
      uniforms: this.mainBgUniforms,
      vertexShader: xylophoneBgVert,
      fragmentShader: xylophoneBgFrag,
      side: DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const mainBg = new Mesh(this.bgGeometry, this.mainBgMaterial);
    mainBg.renderOrder = -1;
    mainBg.frustumCulled = false;
    this.scene.add(mainBg);

    // Xylophone group
    this.xylophoneGroup = new Group();
    this.xylophoneGroup.rotation.set(
      MathUtils.degToRad(XYLOPHONE_PROPS.group.rotXDeg),
      0,
      MathUtils.degToRad(XYLOPHONE_PROPS.group.rotZDeg)
    );
    this.scene.add(this.xylophoneGroup);

    // Reduced motion checks
    if (this.reduceMotion) {
      this.xylophoneUniforms.u_spinSpeed.value = 0;
      this.xylophoneUniforms.u_swingScale.value = 0;
    }

    // Bind event handlers
    this.onResize = this.onResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.renderFrame = this.renderFrame.bind(this);

    this.setTheme(this.currentTheme);
    this.updateResponsiveLayout(width, height);
    (window as unknown as { __SCENE: unknown }).__SCENE = this;

    if (this.reduceMotion) {
      this.renderStatic();
    } else {
      this.startLoop();
    }

    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    window.addEventListener("wheel", this.onWheel, { passive: true });

    void this.loadModel();
  }

  private async loadModel() {
    try {
      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      if (this.isDisposed) return;
      const modelMesh = gltf.scene.children[0] as Mesh;
      this.initXylophoneBars(modelMesh.geometry);
    } catch (err) {
      console.error("[XylophoneScene] Bar model failed to load", err);
    }
  }

  private initXylophoneBars(modelGeometry: BufferGeometry) {
    console.log('[XylophoneScene] Initializing xylophone bars with geometry');
    this.instances = buildInstancedGeometry(modelGeometry, HELIX_CONFIG);
    this.hitInstances = {
      aPos: this.instances.transforms.positions,
      aRot: this.instances.transforms.rotations,
    };
    this.geometryHeight = this.instances.localBox.max.y - this.instances.localBox.min.y;

    this.xylophoneMaterial = new ShaderMaterial({
      uniforms: this.xylophoneUniforms,
      vertexShader: xylophoneVert,
      fragmentShader: xylophoneFrag,
      side: DoubleSide,
    });

    this.xylophoneMesh = new Mesh(this.instances.geometry, this.xylophoneMaterial);
    this.xylophoneMesh.frustumCulled = false;
    this.xylophoneGroup.add(this.xylophoneMesh);

    (window as unknown as { __MODEL_LOADED?: boolean; __IS_ACTIVE_SCENE_READY?: () => boolean }).__MODEL_LOADED = true;
    (window as unknown as { __IS_ACTIVE_SCENE_READY?: () => boolean }).__IS_ACTIVE_SCENE_READY = () =>
      !this.isDisposed && !!this.instances && !!this.xylophoneMesh;

    if (this.reduceMotion) {
      this.renderStatic();
    }
  }

  setTheme(theme: "dark" | "light") {
    this.currentTheme = theme;
    // Keep every element/glass colour exactly as in the xylophone source.
    // LIGHT theme background = xylophone source (0xa391d3 diagonal ramp to white).
    // DARK theme background = flat pure #000000.
    if (theme === "dark") {
      this.mainBgUniforms.u_isDark.value = 1;
    } else {
      this.mainBgUniforms.u_isDark.value = 0;
      this.mainBgUniforms.u_color.value.set(0xa391d3);
    }

    if (this.reduceMotion) {
      this.renderStatic();
    }
  }

  private updateResponsiveLayout(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    if (aspect < 0.6) {
      // Small mobile portrait
      this.camera.position.set(0, -0.15, 6.2);
      this.xylophoneGroup.scale.setScalar(0.44);
    } else if (aspect < 1.0) {
      // Tablet portrait
      this.camera.position.set(0, -0.1, 5.4);
      this.xylophoneGroup.scale.setScalar(0.48);
    } else {
      // Desktop / landscape
      this.camera.position.set(0, 0, 5.0);
      this.xylophoneGroup.scale.setScalar(0.5);
    }
  }

  private onResize() {
    if (this.isDisposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.updateResponsiveLayout(width, height);

    if (this.reduceMotion) {
      this.renderStatic();
    }
  }

  private onPointerMove(e: PointerEvent) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      this.hasPointer = true;
      this.mouseXY.x = (x / rect.width) * 2 - 1;
      this.mouseXY.y = -(y / rect.height) * 2 + 1;
      this.mouseScreenXY.x = x / rect.width;
      this.mouseScreenXY.y = 1 - y / rect.height;
    } else {
      this.hasPointer = false;
    }
  }

  private onPointerLeave() {
    this.hasPointer = false;
  }

  private onWheel(e: WheelEvent) {
    // Accumulate scroll into phase target
    const deltaY = MathUtils.clamp(e.deltaY, -150, 150);
    this.phaseTarget += deltaY * XYLOPHONE_PROPS.scroll.sensitivity;
  }

  private updateScroll(delta: number) {
    if (!this.instances) return;
    this.phaseCurrent = MathUtils.damp(
      this.phaseCurrent,
      this.phaseTarget,
      XYLOPHONE_PROPS.scroll.lerp,
      delta
    );

    if (Math.abs(this.phaseCurrent - this.phaseWritten) > 1e-4) {
      writeHelixTransforms(
        this.phaseCurrent,
        this.geometryHeight,
        HELIX_CONFIG,
        this.instances.transforms.positions,
        this.instances.transforms.rotations,
        this.tempEuler,
        this.tempQuat
      );

      this.instances.geometry.attributes.aPos!.needsUpdate = true;
      this.instances.geometry.attributes.aRot!.needsUpdate = true;
      this.phaseWritten = this.phaseCurrent;
    }
  }

  private updateStrike() {
    if (!this.instances || !this.hitInstances || !this.hasPointer) return;

    this.raycaster.setFromCamera(this.mouseXY, this.camera);
    const index = hitBarIndex(
      this.raycaster.ray,
      this.hitInstances,
      this.instances.localBox,
      this.xylophoneGroup.matrixWorld,
      this.totalTime,
      this.xylophoneUniforms.u_spinSpeed.value,
      this.hitWorkspace
    );

    if (index !== -1 && index !== this.lastHitIndex) {
      this.instances.aStrikeTime.setX(index, this.totalTime);
      this.instances.aStrikeTime.needsUpdate = true;
    }
    this.lastHitIndex = index;
  }

  private startLoop() {
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.renderFrame);
  }

  private renderStatic() {
    // Render backdrop
    this.renderer.setRenderTarget(this.backdropTarget);
    this.renderer.render(this.bgScene, this.bgCamera);
    this.renderer.setRenderTarget(null);

    // Render main
    this.renderer.render(this.scene, this.camera);
  }

  private renderFrame() {
    if (this.isDisposed) return;
    this.rafId = requestAnimationFrame(this.renderFrame);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.totalTime += delta;

    this.xylophoneUniforms.u_time.value = this.totalTime;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Fluid simulation step
    this.fluidSim.solve(this.totalTime, delta, this.mouseScreenXY, width, height, this.renderer);
    this.xylophoneUniforms.u_tFluid.value = this.fluidSim.uniforms.velocity.value;

    // Update helix conveyor scroll & strike hits
    this.updateScroll(delta);
    this.updateStrike();

    // 1. Render backdrop pass for refraction
    this.renderer.setRenderTarget(this.backdropTarget);
    this.renderer.render(this.bgScene, this.bgCamera);
    this.renderer.setRenderTarget(null);

    // 2. Render main scene
    this.renderer.render(this.scene, this.camera);
    if (this.xylophoneMesh) {
      (window as unknown as { __BARS_FRAMES?: number }).__BARS_FRAMES =
        ((window as unknown as { __BARS_FRAMES?: number }).__BARS_FRAMES || 0) + 1;
    }
    (window as unknown as { __FRAME_COUNT?: number }).__FRAME_COUNT =
      ((window as unknown as { __FRAME_COUNT?: number }).__FRAME_COUNT || 0) + 1;
  }

  dispose() {
    this.isDisposed = true;
    delete (window as unknown as { __MODEL_LOADED?: boolean }).__MODEL_LOADED;
    delete (window as unknown as { __IS_ACTIVE_SCENE_READY?: () => boolean }).__IS_ACTIVE_SCENE_READY;
    cancelAnimationFrame(this.rafId);

    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("wheel", this.onWheel);

    this.fluidSim.dispose();
    this.fboHelper.dispose();
    this.backdropTarget.dispose();
    this.gradientTexture.dispose();

    this.bgGeometry.dispose();
    this.bgMaterial.dispose();
    this.mainBgMaterial.dispose();

    if (this.instances) {
      this.instances.geometry.dispose();
    }
    if (this.xylophoneMaterial) {
      this.xylophoneMaterial.dispose();
    }

    this.renderer.dispose();
  }
}

/**
 * 2D WebGL Fluid Simulation solver.
 * Adapted from Pavel Dobryakov's WebGL-Fluid-Simulation (MIT License)
 * & Codrops WebGL Animated Glass Xylophone (MIT License).
 * https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
 */
import {
  FloatType,
  HalfFloatType,
  LinearFilter,
  NearestFilter,
  RawShaderMaterial,
  type RenderTargetOptions,
  RGBAFormat,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  type WebGLRenderer,
} from "three";
import fluidAdvectionFrag from "./shaders/fluid/fluidAdvectionFrag.glsl?raw";
import fluidVert from "./shaders/fluid/fluidBaseVert.glsl?raw";
import fluidClearFrag from "./shaders/fluid/fluidClearFrag.glsl?raw";
import fluidCurlFrag from "./shaders/fluid/fluidCurlFrag.glsl?raw";
import fluidDivergenceFrag from "./shaders/fluid/fluidDivergenceFrag.glsl?raw";
import fluidGradientSubtractFrag from "./shaders/fluid/fluidGradientSubtractFrag.glsl?raw";
import fluidPressureFrag from "./shaders/fluid/fluidPressureFrag.glsl?raw";
import fluidSplatFrag from "./shaders/fluid/fluidSplatFrag.glsl?raw";
import fluidVorticityFrag from "./shaders/fluid/fluidVorticityFrag.glsl?raw";
import { FBO } from "./FBO";
import type { FBOHelper } from "./FBOHelper";

type TouchPoint = {
  position: Vector2;
  prevPosition: Vector2;
  lastUpdate: number;
  lastSplat: number;
  velocity: number;
};

export type FluidSimOptions = {
  simRes: number;
  pressureIterations: number;
  pressureDissipation: number;
  velocityDissipation: number;
  curlStrength: number;
  splatRadius: number;
  splatForce: number;
};

export const DEFAULT_FLUID_CONFIG: FluidSimOptions = {
  simRes: 128,
  curlStrength: 0.2,
  splatRadius: 0.6,
  splatForce: 20,
  pressureIterations: 1,
  velocityDissipation: 0.93,
  pressureDissipation: 0.97,
};

const IDLE_SLEEP_AFTER = 2.5;
const pointerDelta = new Vector2();

function shouldSolveFluid(time: number, lastUserInput: number, sleepAfter: number): boolean {
  return time - lastUserInput <= sleepAfter;
}

export class FluidSim {
  point: TouchPoint;
  private lastUserInput = 0;
  private config: { simTexelSize: number; aspect: number } & FluidSimOptions;
  private helper: FBOHelper;

  private materials: {
    curl: RawShaderMaterial;
    vorticity: RawShaderMaterial;
    divergence: RawShaderMaterial;
    clear: RawShaderMaterial;
    pressure: RawShaderMaterial;
    gradientSubtract: RawShaderMaterial;
    advection: RawShaderMaterial;
    splat: RawShaderMaterial;
  };

  private fbos: {
    velocity: FBO;
    divergence: WebGLRenderTarget;
    curl: WebGLRenderTarget;
    pressure: FBO;
  };

  uniforms: { velocity: { value: Texture | null } };

  private createPassMaterial(
    fragmentShader: string,
    precision: "highp" | "mediump",
    uniforms: Record<string, { value: unknown }>,
    defines?: Record<string, unknown>
  ): RawShaderMaterial {
    return this.helper.createRawShaderMaterial({
      vertexShader: fluidVert,
      fragmentShader,
      vertexShaderPrefix: `precision ${precision} float;\nprecision ${precision} sampler2D;\n`,
      fragmentShaderPrefix: `precision ${precision} float;\nprecision ${precision} sampler2D;\n`,
      uniforms,
      defines,
    });
  }

  private createMaterials() {
    const high = "highp";
    const medium = "mediump";
    const texelSize = () => ({ u_texelSize: { value: new Vector2() } });

    return {
      splat: this.createPassMaterial(fluidSplatFrag, high, {
        ...texelSize(),
        u_tTarget: { value: null },
        u_aspectRatio: { value: 1 },
        u_splatColor: { value: new Vector3() },
        u_splatPosition: { value: new Vector2() },
        u_prevPoint: { value: new Vector2() },
        u_splatRadius: { value: 1 },
      }),

      curl: this.createPassMaterial(fluidCurlFrag, medium, {
        ...texelSize(),
        u_tVelocity: { value: null },
      }),

      vorticity: this.createPassMaterial(fluidVorticityFrag, high, {
        ...texelSize(),
        u_tVelocity: { value: null },
        u_tCurl: { value: null },
        u_curl: { value: this.config.curlStrength },
        u_dt: { value: 1 / 60 },
      }),

      divergence: this.createPassMaterial(fluidDivergenceFrag, medium, {
        ...texelSize(),
        u_tVelocity: { value: null },
      }),

      clear: this.createPassMaterial(fluidClearFrag, medium, {
        ...texelSize(),
        u_tTexture: { value: null },
        u_value: { value: this.config.pressureDissipation },
        u_dt: { value: 1 / 60 },
      }),

      pressure: this.createPassMaterial(fluidPressureFrag, medium, {
        ...texelSize(),
        u_tPressure: { value: null },
        u_tDivergence: { value: null },
      }),

      gradientSubtract: this.createPassMaterial(fluidGradientSubtractFrag, medium, {
        ...texelSize(),
        u_tPressure: { value: null },
        u_tVelocity: { value: null },
      }),

      advection: this.createPassMaterial(
        fluidAdvectionFrag,
        high,
        {
          ...texelSize(),
          u_tVelocity: { value: null },
          u_tSource: { value: null },
          u_dt: { value: 1 / 60 },
          u_dissipation: { value: 1 },
        },
        { MANUAL_FILTERING: true }
      ),
    };
  }

  private createFBOs(helper: FBOHelper) {
    const velocity = new FBO(this.config.simRes, this.config.simRes, helper, {
      format: RGBAFormat,
      type: HalfFloatType,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    });

    const pressure = new FBO(this.config.simRes, this.config.simRes, helper, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    });

    const renderTargetConfig: RenderTargetOptions = {
      type: FloatType,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      depthBuffer: false,
    };

    const divergence = helper.createRenderTarget(this.config.simRes, this.config.simRes, renderTargetConfig);
    const curl = helper.createRenderTarget(this.config.simRes, this.config.simRes, renderTargetConfig);

    return { velocity, pressure, divergence, curl };
  }

  constructor(helper: FBOHelper, options: Partial<FluidSimOptions> = {}) {
    this.helper = helper;
    const merged = { ...DEFAULT_FLUID_CONFIG, ...options };
    this.config = {
      ...merged,
      simTexelSize: 1 / merged.simRes,
      aspect: 1,
    };

    this.point = {
      position: new Vector2(0.5, 0.5),
      prevPosition: new Vector2(0.5, 0.5),
      lastUpdate: 0,
      lastSplat: 0,
      velocity: 0,
    };

    this.fbos = this.createFBOs(helper);
    this.materials = this.createMaterials();
    this.uniforms = { velocity: { value: null } };
  }

  updatePoint(time: number, mouseScreenXY: Vector2, renderer: WebGLRenderer) {
    this.point.position.copy(mouseScreenXY);
    const point = this.point;

    // Skip if updated too recently (60fps throttle)
    if (time - point.lastUpdate < 0.016) return;

    pointerDelta.subVectors(point.position, point.prevPosition);
    const distance = pointerDelta.length();

    point.velocity += distance * 2;

    if (distance > 0) {
      if (distance > 0.001) {
        this.lastUserInput = time;
      }

      const shouldStartNewLine = time - point.lastSplat > 0.15;

      this.materials.splat.uniforms.u_tTarget!.value = this.fbos.velocity.read.texture;
      this.materials.splat.uniforms.u_aspectRatio!.value = this.config.aspect;
      (this.materials.splat.uniforms.u_splatPosition!.value as Vector2).copy(point.position);
      (this.materials.splat.uniforms.u_prevPoint!.value as Vector2).copy(
        shouldStartNewLine ? point.position : point.prevPosition
      );
      (this.materials.splat.uniforms.u_splatColor!.value as Vector3)
        .set(pointerDelta.x * this.config.aspect, pointerDelta.y, 0)
        .multiplyScalar(this.config.splatForce)
        .multiplyScalar(shouldStartNewLine ? 0 : 1);
      this.materials.splat.uniforms.u_splatRadius!.value = this.config.splatRadius * point.velocity;

      this.helper.render(this.materials.splat, this.fbos.velocity.write, renderer);
      this.fbos.velocity.swap();

      point.lastSplat = time;
    }

    point.lastUpdate = time;
    point.prevPosition.copy(point.position);
    point.velocity *= 0.9;
    point.velocity = Math.min(1, point.velocity);
  }

  solve(time: number, delta: number, mouseScreenXY: Vector2, width: number, height: number, renderer: WebGLRenderer): void {
    this.config.aspect = width / height;

    const savedAutoClear = renderer.autoClear;
    const savedRenderTarget = renderer.getRenderTarget();
    renderer.autoClear = false;

    this.updatePoint(time, mouseScreenXY, renderer);

    if (!shouldSolveFluid(time, this.lastUserInput, IDLE_SLEEP_AFTER)) {
      renderer.autoClear = savedAutoClear;
      renderer.setRenderTarget(savedRenderTarget);
      return;
    }

    // Curl
    (this.materials.curl.uniforms.u_texelSize!.value as Vector2).setScalar(this.config.simTexelSize);
    this.materials.curl.uniforms.u_tVelocity!.value = this.fbos.velocity.read.texture;
    this.helper.render(this.materials.curl, this.fbos.curl, renderer);

    // Vorticity
    (this.materials.vorticity.uniforms.u_texelSize!.value as Vector2).setScalar(this.config.simTexelSize);
    this.materials.vorticity.uniforms.u_tVelocity!.value = this.fbos.velocity.read.texture;
    this.materials.vorticity.uniforms.u_tCurl!.value = this.fbos.curl.texture;
    this.materials.vorticity.uniforms.u_curl!.value = this.config.curlStrength;
    this.materials.vorticity.uniforms.u_dt!.value = delta;
    this.helper.render(this.materials.vorticity, this.fbos.velocity.write, renderer);
    this.fbos.velocity.swap();

    // Divergence
    (this.materials.divergence.uniforms.u_texelSize!.value as Vector2).setScalar(this.config.simTexelSize);
    this.materials.divergence.uniforms.u_tVelocity!.value = this.fbos.velocity.read.texture;
    this.helper.render(this.materials.divergence, this.fbos.divergence, renderer);

    // Clear pressure
    this.materials.clear.uniforms.u_tTexture!.value = this.fbos.pressure.read.texture;
    this.materials.clear.uniforms.u_value!.value = this.config.pressureDissipation;
    this.materials.clear.uniforms.u_dt!.value = delta;
    this.helper.render(this.materials.clear, this.fbos.pressure.write, renderer);
    this.fbos.pressure.swap();

    // Pressure Jacobi iterations
    (this.materials.pressure.uniforms.u_texelSize!.value as Vector2).setScalar(this.config.simTexelSize);
    this.materials.pressure.uniforms.u_tDivergence!.value = this.fbos.divergence.texture;

    for (let i = 0; i < this.config.pressureIterations; i++) {
      this.materials.pressure.uniforms.u_tPressure!.value = this.fbos.pressure.read.texture;
      this.helper.render(this.materials.pressure, this.fbos.pressure.write, renderer);
      this.fbos.pressure.swap();
    }

    // Gradient subtract
    (this.materials.gradientSubtract.uniforms.u_texelSize!.value as Vector2).setScalar(this.config.simTexelSize);
    this.materials.gradientSubtract.uniforms.u_tPressure!.value = this.fbos.pressure.read.texture;
    this.materials.gradientSubtract.uniforms.u_tVelocity!.value = this.fbos.velocity.read.texture;
    this.helper.render(this.materials.gradientSubtract, this.fbos.velocity.write, renderer);
    this.fbos.velocity.swap();

    // Advection
    (this.materials.advection.uniforms.u_texelSize!.value as Vector2).setScalar(this.config.simTexelSize);
    this.materials.advection.uniforms.u_tVelocity!.value = this.fbos.velocity.read.texture;
    this.materials.advection.uniforms.u_tSource!.value = this.fbos.velocity.read.texture;
    this.materials.advection.uniforms.u_dt!.value = delta;
    this.materials.advection.uniforms.u_dissipation!.value = this.config.velocityDissipation;
    this.helper.render(this.materials.advection, this.fbos.velocity.write, renderer);
    this.fbos.velocity.swap();

    this.uniforms.velocity.value = this.fbos.velocity.read.texture;

    renderer.autoClear = savedAutoClear;
    renderer.setRenderTarget(savedRenderTarget);
  }

  dispose(): void {
    this.materials.clear.dispose();
    this.materials.splat.dispose();
    this.materials.curl.dispose();
    this.materials.vorticity.dispose();
    this.materials.divergence.dispose();
    this.materials.pressure.dispose();
    this.materials.gradientSubtract.dispose();
    this.materials.advection.dispose();

    this.fbos.velocity.dispose();
    this.fbos.pressure.dispose();
    this.fbos.divergence.dispose();
    this.fbos.curl.dispose();
  }
}

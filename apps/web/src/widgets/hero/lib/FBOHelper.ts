/**
 * FBO & FullScreenQuad helper for GPGPU passes.
 * Adapted from Codrops WebGL Animated Glass Xylophone (MIT License).
 * Copyright (c) 2009 - 2026 Codrops (https://codrops.com)
 */
import {
  ClampToEdgeWrapping,
  LinearFilter,
  Material,
  RawShaderMaterial,
  type RenderTargetOptions,
  SRGBColorSpace,
  type ShaderMaterialParameters,
  UnsignedByteType,
  WebGLRenderTarget,
  type WebGLRenderer,
} from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import blitFrag from "./shaders/postprocessing/blitFrag.glsl?raw";
import blitVert from "./shaders/postprocessing/blitVert.glsl?raw";

export class FBOHelper {
  private fsQuad: FullScreenQuad;
  private precisionPrefix: string;

  constructor(renderer: WebGLRenderer) {
    this.fsQuad = new FullScreenQuad();
    this.precisionPrefix = `precision ${renderer.capabilities.precision} float;\n`;
  }

  render(material: Material, renderTarget: WebGLRenderTarget | null, renderer: WebGLRenderer) {
    this.fsQuad.material = material;
    renderer.setRenderTarget(renderTarget);
    this.fsQuad.render(renderer);
    renderer.setRenderTarget(null);
  }

  createRenderTarget(width: number, height: number, options?: RenderTargetOptions) {
    return new WebGLRenderTarget(width, height, {
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      magFilter: LinearFilter,
      minFilter: LinearFilter,
      type: UnsignedByteType,
      anisotropy: 0,
      colorSpace: SRGBColorSpace,
      stencilBuffer: false,
      ...options,
    });
  }

  createRawShaderMaterial(
    options: ShaderMaterialParameters & { vertexShaderPrefix?: string; fragmentShaderPrefix?: string }
  ) {
    const opts: ShaderMaterialParameters & { vertexShaderPrefix?: string; fragmentShaderPrefix?: string } = {
      vertexShader: blitVert,
      fragmentShader: blitFrag,
      ...options,
    };

    if (!opts.defines) {
      delete opts.defines;
    }

    opts.vertexShader =
      (opts.vertexShaderPrefix !== undefined ? opts.vertexShaderPrefix : this.precisionPrefix) +
      opts.vertexShader;

    opts.fragmentShader =
      (opts.fragmentShaderPrefix !== undefined ? opts.fragmentShaderPrefix : this.precisionPrefix) +
      opts.fragmentShader;

    delete opts.vertexShaderPrefix;
    delete opts.fragmentShaderPrefix;

    return new RawShaderMaterial(opts);
  }

  dispose() {
    this.fsQuad.dispose();
  }
}

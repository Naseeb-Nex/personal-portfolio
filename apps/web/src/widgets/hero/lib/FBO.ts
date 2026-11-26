/**
 * Double-buffered ping-pong render target for GPGPU fluid simulation.
 * Adapted from Codrops WebGL Animated Glass Xylophone (MIT License).
 * Copyright (c) 2009 - 2026 Codrops (https://codrops.com)
 */
import { FloatType, type RenderTargetOptions, RGBAFormat, WebGLRenderTarget } from "three";
import type { FBOHelper } from "./FBOHelper";

export class FBO {
  private fbo1: WebGLRenderTarget;
  private fbo2: WebGLRenderTarget;

  constructor(width: number, height: number, helper: FBOHelper, options?: RenderTargetOptions) {
    const config: RenderTargetOptions = {
      format: RGBAFormat,
      type: FloatType,
      generateMipmaps: false,
      depthBuffer: false,
      ...options,
    };

    this.fbo1 = helper.createRenderTarget(width, height, config);
    this.fbo2 = helper.createRenderTarget(width, height, config);
  }

  get read() {
    return this.fbo1;
  }

  get write() {
    return this.fbo2;
  }

  swap() {
    const temp = this.fbo1;
    this.fbo1 = this.fbo2;
    this.fbo2 = temp;
  }

  dispose() {
    this.fbo1.dispose();
    this.fbo2.dispose();
  }
}

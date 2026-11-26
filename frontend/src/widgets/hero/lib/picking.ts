/**
 * Ray-box instance intersection for xylophone bars.
 * Adapted from Codrops WebGL Animated Glass Xylophone (MIT License).
 * Copyright (c) 2009 - 2026 Codrops (https://codrops.com)
 */
import { Box3, Matrix4, Quaternion, Ray, Vector3 } from "three";

export type InstanceAttributes = { aPos: Float32Array; aRot: Float32Array };

export function createHitWorkspace() {
  return {
    spin: new Quaternion(),
    aRotQ: new Quaternion(),
    rotQ: new Quaternion(),
    pos: new Vector3(),
    scale: new Vector3(1, 1, 1),
    mat: new Matrix4(),
    inv: new Matrix4(),
    ray: new Ray(),
    hit: new Vector3(),
  };
}

export type HitWorkspace = ReturnType<typeof createHitWorkspace>;

export function hitBarIndex(
  worldRay: Ray,
  instances: InstanceAttributes,
  localBox: Box3,
  groupMatrixWorld: Matrix4,
  time: number,
  spinSpeed: number,
  work: HitWorkspace
): number {
  const { aPos, aRot } = instances;
  const count = aPos.length / 3;

  const half = time * spinSpeed * 0.5;
  work.spin.set(0, Math.sin(half), 0, Math.cos(half));

  let hitIndex = -1;
  let hitDist = Infinity;

  for (let i = 0; i < count; i++) {
    work.aRotQ.set(aRot[i * 4]!, aRot[i * 4 + 1]!, aRot[i * 4 + 2]!, aRot[i * 4 + 3]!);
    work.rotQ.multiplyQuaternions(work.spin, work.aRotQ);
    work.pos.set(aPos[i * 3]!, aPos[i * 3 + 1]!, aPos[i * 3 + 2]!);

    work.mat.compose(work.pos, work.rotQ, work.scale);
    work.mat.premultiply(groupMatrixWorld);
    work.inv.copy(work.mat).invert();

    work.ray.copy(worldRay).applyMatrix4(work.inv);

    const hit = work.ray.intersectBox(localBox, work.hit);
    if (hit) {
      hit.applyMatrix4(work.mat);
      const d = worldRay.origin.distanceToSquared(hit);
      if (d < hitDist) {
        hitDist = d;
        hitIndex = i;
      }
    }
  }

  return hitIndex;
}

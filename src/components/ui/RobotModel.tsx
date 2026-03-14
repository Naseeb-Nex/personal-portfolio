'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Preload the model to avoid pop-in
useGLTF.preload('/models/robo/scene.gltf');

function Model() {
  const group = useRef<THREE.Group>(null);
  
  // Best approach for Next.js is loading models from the public directory.
  // Using dynamic imports for assets inside src/assets/... is very complicated to configure
  // for Next.js Webpack with raw binary/texture chunks, so public/ is the recommended path.
  const { scene, animations } = useGLTF('/models/robo/scene.gltf');
  const { actions, mixer } = useAnimations(animations, group);

  // Play all animations in an infinite loop automatically
  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.reset().play();
        }
      });
    }
    return () => {
      mixer?.stopAllAction();
    };
  }, [actions, mixer]);


  return (
    <group ref={group} dispose={null}>
      {/* Adjust scale and position as needed according to the GLTF model size */}
      <primitive object={scene} scale={1.6} position={[0, -1.5, 0]} rotation={[0, -0.4, 0]} />
      
      {/* Subtle ContactShadows beneath the robot */}
      <ContactShadows 
        position={[0, -1.5, 0]} 
        opacity={0.5} 
        scale={12} 
        blur={2.5} 
        far={5} 
      />
    </group>
  );
}

export default function RobotModel() {
  return (
    // Wrap to full dimensions, NO pointer-events to prevent zoom/pan controls overlapping other interactions
    <div className="w-full h-full min-h-[50vh] md:min-h-full cursor-default pointer-events-none relative z-10">
      <Canvas
        camera={{ position: [0, 1, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        className="w-full h-full pointer-events-none"
      >
        <Suspense fallback={null}>
          {/* Proper lighting for the robot */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <directionalLight position={[-10, 10, -10]} intensity={0.5} />
          <Model />
        </Suspense>
      </Canvas>
    </div>
  );
}

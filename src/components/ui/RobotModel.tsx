'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Preload the model to avoid pop-in
useGLTF.preload('/models/robo/scene.gltf');

function Model() {
  const group = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: -0.4 });
  
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Calculate target rotation (adjust division factors to control rotation range)
      targetRotation.current.x = (y * Math.PI) / 12; // subtle pitch up/down
      targetRotation.current.y = -0.4 + (x * Math.PI) / 8; // subtle yaw left/right
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (group.current) {
      // Smoothly interpolate current rotation towards target rotation
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotation.current.x, 4, delta);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotation.current.y, 4, delta);
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -1.5, 0]} rotation={[0, -0.4, 0]}>
      {/* Adjust scale and position as needed according to the GLTF model size */}
      <primitive object={scene} scale={1.6} />
      
      {/* Subtle ContactShadows beneath the robot */}
      <ContactShadows 
        position={[0, 0, 0]} 
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

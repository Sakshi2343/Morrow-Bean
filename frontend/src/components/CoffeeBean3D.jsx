import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const ProceduralBean = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      (state.pointer.x * Math.PI) / 2 + t * 0.2,
      0.05
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      -(state.pointer.y * Math.PI) / 2 + t * 0.1,
      0.05
    );
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
      <group ref={meshRef}>
        <mesh scale={[1.2, 1.6, 0.8]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#3b1f0f" 
            roughness={0.2}
            metalness={0.1}
            envMapIntensity={1.5}
          />
        </mesh>
        {/* Bean crack/crease */}
        <mesh position={[0, 0, 0.75]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.08, 2.8, 0.4]} />
          <meshStandardMaterial color="#110703" roughness={0.9} />
        </mesh>
      </group>
    </Float>
  );
};

export default function CoffeeBean3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-60">
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#fcd34d" />
        <directionalLight position={[-5, -5, 2]} intensity={1.5} color="#d97706" />
        <ProceduralBean />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

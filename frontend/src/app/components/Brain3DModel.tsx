"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

function FallbackBrain() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#2563eb"
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.2}
          clearcoatRoughness={0.4}
          emissive="#1e40af"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

function ModelScene({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath) as { scene: THREE.Group };
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Calcular el bounding box del modelo para centrarlo
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Centrar el modelo restando su centro actual
    scene.position.sub(center);

    // Ajustar la escala para que quepa bien en la vista
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxDim;
    scene.scale.setScalar(scale);
  }, [scene]);

  return (
    <group ref={groupRef} scale={[0.15, 0.15, 0.15]} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#60a5fa" />
      <pointLight position={[0, 3, 3]} intensity={1.2} color="#93c5fd" />
      <directionalLight position={[0, 0, 5]} intensity={0.8} color="#ffffff" />
    </>
  );
}

export default function Brain3DModel() {
  const modelPath = "/models/blue_brain.glb";
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(modelPath, { method: "HEAD" })
      .then((response) => setModelAvailable(response.ok))
      .catch(() => setModelAvailable(false));
  }, [modelPath]);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 35 }} style={{ width: "100%", height: "100%" }}>
        <Lights />
        {modelAvailable === true ? (
          <Suspense fallback={<FallbackBrain />}>
            <ModelScene modelPath={modelPath} />
          </Suspense>
        ) : (
          <FallbackBrain />
        )}
        <OrbitControls 
          autoRotate={false} 
          enableZoom={true} 
          enablePan={true}
          minDistance={0.5}
          maxDistance={5}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  );
}

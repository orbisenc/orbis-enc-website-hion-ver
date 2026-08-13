"use client";

import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function Model({ path }: { path: string }) {
  const model = useGLTF(path);
  return <primitive object={model.scene} scale={1.15} />;
}

export default function FacilityModelCanvas({ modelPath }: { modelPath: string }) {
  return <Canvas camera={{ position: [7, 6, 8], fov: 42 }}><ambientLight intensity={1.3} /><directionalLight position={[5, 9, 6]} intensity={2.2} /><Suspense fallback={null}><Model path={modelPath} /><Environment preset="city" /></Suspense><OrbitControls makeDefault enableDamping enablePan enableZoom /></Canvas>;
}

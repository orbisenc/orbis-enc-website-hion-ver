"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MousePointer2, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { Asset } from "@/types/facility";

type Vector3Tuple = [number, number, number];

interface Props { assets: Asset[]; selectedAssetId: string | null; onSelect: (assetId: string | null) => void }

function Box({ position, size, color, opacity = 1 }: { position: Vector3Tuple; size: Vector3Tuple; color: string; opacity?: number }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.68} transparent={opacity < 1} opacity={opacity} /></mesh>;
}

function ApartmentBuilding({ index, x, z }: { index: number; x: number; z: number }) {
  const height = 7.8 + (index % 3) * 1.15;
  const floors = 15 + (index % 3) * 3;
  const building = 101 + index;
  return <group position={[x, 0, z]}>
    <Box position={[0, height / 2, 0]} size={[2.15, height, 2.5]} color={index % 2 ? "#dce8f3" : "#edf3f8"} />
    <Box position={[0, height + .17, 0]} size={[2.35, .34, 2.7]} color="#8ca9c4" />
    {Array.from({ length: floors }, (_, floor) => {
      const y = .35 + floor * (height - .7) / floors;
      return <group key={floor}>
        <Box position={[0, y, 1.27]} size={[1.78, .05, .035]} color="#92bdd8" />
        <Box position={[1.09, y, 0]} size={[.035, .05, 1.9]} color="#92bdd8" />
      </group>;
    })}
    <Box position={[0, .32, 1.31]} size={[.78, .64, .08]} color="#0b63ce" />
    <Html center position={[0, height + .65, 0]} distanceFactor={18} zIndexRange={[8, 0]}><span className="facility-building-label">{building}동</span></Html>
  </group>;
}

function ApartmentComplex() {
  const positions: Array<[number, number]> = [[-10.5,-2.7],[-7.5,2.2],[-4.5,-2.7],[-1.5,2.2],[1.5,-2.7],[4.5,2.2],[7.5,-2.7],[10.5,2.2]];
  return <group position={[0, -1.2, 0]}>
    <Box position={[0, -.75, 0]} size={[27, 1.35, 10]} color="#53677b" opacity={.92} />
    <Box position={[0, -.03, 0]} size={[27.8, .16, 10.8]} color="#9fb5c5" />
    <Box position={[0, .06, 0]} size={[3.7, .08, 9.6]} color="#64788c" />
    {positions.map(([x, z], index) => <ApartmentBuilding key={index} index={index} x={x} z={z} />)}
    <group position={[0,.28,0]}>{[-1.2,0,1.2].map((x) => <mesh key={x} position={[x,0,0]}><cylinderGeometry args={[.34,.34,.68,18]} /><meshStandardMaterial color="#19bde2" roughness={.4} /></mesh>)}</group>
    <Box position={[-11.9,.22,4.1]} size={[1.7,.42,.5]} color="#082b5c" />
    <Box position={[11.9,.22,4.1]} size={[1.7,.42,.5]} color="#082b5c" />
  </group>;
}

const statusColors: Record<Asset["status"], string> = { normal: "#1677ff", attention: "#f59e0b", urgent: "#dc2626", inspection: "#7c3aed", offline: "#64748b" };

function Scene({ assets, selectedAssetId, onSelect }: Props) {
  return <group><ApartmentComplex />{assets.map((asset, index) => {
    const position = asset.position3D ? [asset.position3D.x, asset.position3D.y, asset.position3D.z] as Vector3Tuple : [0, 1, 0] as Vector3Tuple;
    return <Html key={asset.id} center position={position} distanceFactor={16} zIndexRange={[20, 0]}><button type="button" className={`facility-hotspot is-3d ${selectedAssetId === asset.id ? "is-selected" : ""}`} style={{ borderColor: statusColors[asset.status] }} onClick={(event) => { event.stopPropagation(); onSelect(asset.id); }} aria-label={`${asset.name} 상세 열기`}><span style={{ background: statusColors[asset.status] }}>{index + 1}</span><strong>{asset.name}</strong><em>{asset.locationLabel}</em></button></Html>;
  })}</group>;
}

export default function FacilityImage3D(props: Props) {
  const [viewKey, setViewKey] = useState(0);
  return <div className="facility-image-3d" role="region" aria-label="HION 스마트파크 시설 3D 모델 보기">
    <Canvas key={viewKey} camera={{ position: [18, 14, 22], fov: 42, near: .1, far: 120 }} dpr={[1, 1.5]} shadows onPointerMissed={() => props.onSelect(null)}>
      <color attach="background" args={["#eaf4fd"]} /><ambientLight intensity={1.25} /><hemisphereLight args={["#effbff", "#526174", 1.4]} /><directionalLight position={[10, 18, 12]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Scene {...props} /><gridHelper args={[34, 34, "#7795aa", "#c6d5df"]} position={[0,-2,0]} />
      <OrbitControls makeDefault enableDamping enablePan enableRotate enableZoom minDistance={13} maxDistance={46} minPolarAngle={.3} maxPolarAngle={Math.PI / 2.03} target={[0,3,0]} />
    </Canvas>
    <div className="facility-3d-model-badge">HION 스마트파크 · 8개 동 절차형 3D 단지</div>
    <div className="facility-3d-help"><MousePointer2 size={14} /> 드래그 회전 · 휠 확대 · 우클릭 이동</div>
    <button type="button" className="facility-3d-reset" onClick={() => setViewKey((key) => key + 1)} aria-label="3D 시점 초기화"><RotateCcw size={14} /> 시점 초기화</button>
  </div>;
}

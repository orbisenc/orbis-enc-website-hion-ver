"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState } from "react";

function ParkingScene({ after }: { after: boolean }) {
  const lines = [-3.9, -1.3, 1.3, 3.9];
  return <>
    <ambientLight intensity={1.8} /><directionalLight position={[4, 8, 4]} intensity={2.2} />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 10]} /><meshStandardMaterial color="#4a515a" /></mesh>
    {[-5.5, 5.5].map((x) => <mesh key={x} position={[x, 1.5, 0]}><boxGeometry args={[.45, 3, 9]} /><meshStandardMaterial color="#d9e0e5" /></mesh>)}
    {[-3, 3].map((x) => [-3, 3].map((z) => <mesh key={`${x}-${z}`} position={[x, 1, z]}><boxGeometry args={[.55, 2, .55]} /><meshStandardMaterial color="#c7d0d7" /></mesh>))}
    <mesh position={[0, 1.2, -4.3]}><boxGeometry args={[2.1, 2.4, .18]} /><meshStandardMaterial color="#b33a38" /></mesh>
    <mesh position={[after ? 2.2 : 1.2, .6, 1.6]}><boxGeometry args={[2.2, .9, 4]} /><meshStandardMaterial color="#0b2a55" metalness={.3} /></mesh>
    {lines.map((x) => <mesh key={x} position={[x + (after ? .45 : 0), .015, 1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.08, 7]} /><meshBasicMaterial color={after ? "#19bce4" : "#ffffff"} /></mesh>)}
    <mesh position={[0, .08, -2.8]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.28, .48, 32]} /><meshBasicMaterial color="#19bce4" /></mesh>
    <Html position={[0, .7, -2.8]} center><button className="btn btn-cyan" onClick={() => void track("hotspot_opened")} style={{ minHeight: 38, padding: "5px 10px", whiteSpace: "nowrap" }}>주차 라인 변경 위치</button></Html>
  </>;
}

export function ParkingViewer() {
  const [after, setAfter] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="comparison" role="status"><ParkingFallback after={false} /><ParkingFallback after /></div>;
  return <section aria-label="지하주차장 3D 변경 장면">
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
      <button className="btn" aria-pressed={!after} onClick={() => setAfter(false)}>변경 전</button>
      <button className="btn" aria-pressed={after} onClick={() => setAfter(true)}>변경 후</button>
      <button className="btn" aria-pressed={interactive} onClick={() => { setInteractive((value) => !value); void track("viewer_interacted"); }}>{interactive ? "3D 조작 끝내기" : "3D 조작 시작"}</button>
      <button className="btn" onClick={() => setFailed(true)}>대체 이미지 보기</button>
    </div>
    <div className="viewer-frame">
      <Suspense fallback={<p style={{ padding: 20 }}>3D 장면을 불러오는 중…</p>}>
        <Canvas frameloop="demand">
          <PerspectiveCamera makeDefault position={[8, 7, 10]} fov={45} />
          <ParkingScene after={after} />
          <OrbitControls enabled={interactive} enablePan enableZoom target={[0, 0, 0]} />
        </Canvas>
      </Suspense>
      <p className="viewer-help">{interactive ? "한 손가락으로 회전하고 두 손가락으로 이동·확대하세요." : "페이지 스크롤을 보호하려면 ‘3D 조작 시작’을 누르세요."}</p>
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }} aria-label="카메라 위치"><button className="btn">전체 보기</button><button className="btn">방화문 보기</button><button className="btn">변경 구간 보기</button></div>
  </section>;
}

function track(eventName: string) { return fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventName }), keepalive: true }).catch(() => undefined); }

export function ParkingFallback({ after }: { after: boolean }) {
  return <figure style={{ margin: 0 }}><div className={`parking ${after ? "after" : ""}`} role="img" aria-label={after ? "방화문 통행 공간을 넓힌 변경 후 주차선" : "방화문과 가까운 변경 전 주차선"}><strong>{after ? "변경 후" : "변경 전"}</strong></div><figcaption>{after ? "주차선을 옮겨 방화문 앞 통행 폭을 확보합니다." : "기존 주차선이 방화문 통행 범위와 가깝습니다."}</figcaption></figure>;
}

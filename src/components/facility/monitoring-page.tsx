"use client";

import { ArrowLeft, CloudSun, Droplets, Gauge, Leaf, Pause, Play, Radio, RefreshCw, ThermometerSun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function MonitoringPage() {
  const [running, setRunning] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("10:30:00");
  const [temperature, setTemperature] = useState(28);
  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => { setUpdatedAt(new Date().toLocaleTimeString("ko-KR", { hour12: false })); setTemperature((value) => value === 28 ? 27.9 : 28); }, 5000);
    return () => window.clearInterval(interval);
  }, [running]);
  const refresh = () => { setUpdatedAt(new Date().toLocaleTimeString("ko-KR", { hour12: false })); };
  return <div className="facility-page"><div className="facility-page-heading"><div><Link className="facility-back-link" href="/dashboard"><ArrowLeft size={15} /> 대시보드</Link><h1>현장 모니터링</h1><p>BMS, FMS, IoT 센서의 최신 상태를 통합 확인합니다.</p></div><div className="facility-heading-actions"><span className={`facility-live-state ${running ? "is-live" : ""}`}><Radio size={14} /> {running ? "실시간 수신 중" : "수신 일시정지"}</span><button className="facility-button" type="button" onClick={() => setRunning((value) => !value)}>{running ? <Pause size={15} /> : <Play size={15} />}{running ? "일시정지" : "재개"}</button><button className="facility-button primary" type="button" onClick={refresh}><RefreshCw size={15} /> 새로고침</button></div></div>
    <section className="facility-monitor-grid"><SensorCard icon={ThermometerSun} label="외기 온도" value={`${temperature}℃`} status="정상" /><SensorCard icon={Droplets} label="상대 습도" value="62%" status="정상" /><SensorCard icon={Leaf} label="미세먼지" value="좋음" status="PM2.5 11㎍/㎥" /><SensorCard icon={Gauge} label="실내 CO₂" value="612 ppm" status="정상" /></section>
    <div className="facility-monitor-layout"><section className="facility-page-panel"><div className="facility-section-heading"><div><h2>구역별 환경 상태</h2><p>마지막 갱신 {updatedAt}</p></div><CloudSun /></div><div className="facility-zone-list">{[["본관 교실동","27.4℃","58%","정상"],["과학실·특별교실","27.8℃","61%","정상"],["체육관","28.6℃","65%","주의"],["급식실","29.1℃","67%","주의"],["기계실","26.2℃","55%","정상"]].map((row) => <div key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span><em className={row[3] === "정상" ? "is-normal" : "is-warning"}>{row[3]}</em></div>)}</div></section><section className="facility-page-panel"><div className="facility-section-heading"><div><h2>연동 시스템</h2><p>데이터 연결 상태</p></div></div><div className="facility-system-list">{[["BMS","건물 에너지·공조","정상"],["FMS","시설 자산·점검","정상"],["IoT 센서","환경 센서 42개","정상"],["소방 수신기","경보·회로 상태","정상"]].map((row) => <div key={row[0]}><i /><span><strong>{row[0]}</strong><small>{row[1]}</small></span><em>{row[2]}</em></div>)}</div></section></div>
  </div>;
}

function SensorCard({ icon: Icon, label, value, status }: { icon: typeof CloudSun; label: string; value: string; status: string }) { return <article className="facility-sensor-card"><Icon /><span>{label}</span><strong>{value}</strong><small>{status}</small></article>; }

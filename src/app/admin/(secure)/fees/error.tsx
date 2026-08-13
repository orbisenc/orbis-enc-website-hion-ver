"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="card" role="alert"><h1>관리비 정보를 불러오지 못했습니다</h1><p>잠시 후 다시 시도하거나 관리비 데이터 등록 상태를 확인해 주세요.</p><button className="btn btn-primary" onClick={reset}>다시 시도</button></section>; }

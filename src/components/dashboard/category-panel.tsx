"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { useDashboardStore } from "@/store/dashboardStore";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function CategoryPanel() {
  const selected = useDashboardStore((state) => state.selectedCategory);
  const setSelected = useDashboardStore((state) => state.setSelectedCategory);
  const summary = mockDashboardData.categorySummary;
  const chartSegments = summary.map((item, index) => ({ ...item, offset: -summary.slice(0, index).reduce((total, segment) => total + segment.percentage, 0) }));
  return <section className="facility-panel facility-category-panel">
    <h2>객체 분류 현황</h2>
    <div className="facility-category-content">
      <div className="facility-donut-wrap" role="img" aria-label={`전체 자산 ${mockDashboardData.assets.length}개의 분류별 비율 도넛 차트`}>
        <svg className="facility-svg-donut" viewBox="0 0 42 42" aria-hidden="true">
          {chartSegments.map((item) => <circle key={item.id} cx="21" cy="21" r="15.9155" fill="none" stroke={item.color} strokeWidth="7" strokeDasharray={`${item.percentage} ${100 - item.percentage}`} strokeDashoffset={item.offset} opacity={!selected || selected === item.id ? 1 : .24} onClick={() => setSelected(item.id)} />)}
        </svg>
        <div className="facility-donut-label"><strong>{mockDashboardData.assets.length}</strong><span>전체 자산</span></div>
      </div>
      <div className="facility-legend">
        {summary.map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><i style={{ backgroundColor: item.color }} /><span>{item.label}</span><strong>{item.count}</strong><small>({item.percentage}%)</small></button>)}
      </div>
    </div>
    {selected && <p className="facility-filter-note"><strong>{summary.find((item) => item.id === selected)?.label}</strong> 객체만 표시 중</p>}
    <Link className="facility-more-link" href="/assets">전체 객체 보기 <ChevronRight size={15} /></Link>
  </section>;
}

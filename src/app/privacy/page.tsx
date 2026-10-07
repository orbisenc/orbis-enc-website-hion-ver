import type { Metadata } from "next";
import { legalConfig, siteConfig } from "@/content/site";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata:Metadata=pageMetadata({title:"개인정보처리방침 | ORBIS D&C",description:"ORBIS D&C 문의 과정에서 처리하는 개인정보에 관한 안내입니다.",path:"/privacy",noindex:!legalConfig.approved});

export default function PrivacyPage(){return <MarketingPage><BreadcrumbJsonLd items={[{name:"홈",path:"/"},{name:"개인정보처리방침",path:"/privacy"}]}/><section className="section"><div className="marketing-container"><div className="section-heading privacy-heading"><p className="eyebrow">PRIVACY</p><h1>개인정보처리방침</h1><p>문의 과정에서 입력하는 개인정보의 처리 구조를 안내합니다.</p></div><div className="privacy-prose">{!legalConfig.approved?<div className="privacy-status" role="note"><strong>법무 검토 필요</strong><br/>현재 보유기간, 개인정보 보호책임자와 처리 수탁자 정보가 확정되지 않아 이 페이지는 검색엔진에 노출되지 않습니다. 아래 내용은 공개 승인 전 구조 안내이며 확정된 개인정보처리방침이 아닙니다.</div>:null}
<section><h2>1. 수집하는 개인정보 항목</h2><p>도입·기술·제휴 문의 시 다음 정보를 입력받도록 구성되어 있습니다.</p><table className="privacy-table"><thead><tr><th>구분</th><th>항목</th></tr></thead><tbody><tr><td>필수</td><td>문의 유형, 기관·회사명, 이름, 업무 이메일, 연락처, 시설 유형, 개인정보 수집·이용 동의</td></tr><tr><td>선택</td><td>부서·직책, 대상 규모, 도입 시기</td></tr></tbody></table></section>
<section><h2>2. 개인정보 처리 목적</h2><p>입력 정보는 문의 내용 확인, 담당자 배정, 답변과 후속 상담을 위해 사용하도록 설계되어 있습니다. 광고성 정보 수신 동의는 받지 않습니다.</p></section>
<section><h2>3. 보유 및 이용 기간</h2><p>보유기간과 예외 보존 기준은 법무 검토 후 확정해야 합니다. 승인 전에는 이 항목을 확정된 정책으로 간주할 수 없습니다.</p></section>
<section><h2>4. 파기 절차와 방법</h2><p>처리 목적 달성 또는 승인된 보유기간 종료 시의 파기 절차와 전자적 기록의 안전한 삭제 방법은 운영 시스템과 법무 검토를 거쳐 확정해야 합니다.</p></section>
<section><h2>5. 처리 위탁 및 제3자 제공</h2><p>문의 전달에 사용되는 운영 서비스와 수탁자 정보는 실제 어댑터 확정 후 공개해야 합니다. 현재 확인되지 않은 수탁자나 제3자 제공 내역은 기재하지 않습니다.</p></section>
<section><h2>6. 정보주체의 권리와 행사 방법</h2><p>열람, 정정, 삭제, 처리정지 요청의 접수 절차와 본인 확인 방법은 법무 검토 후 확정해야 합니다.</p></section>
<section><h2>7. 개인정보 보호 문의</h2><p>개인정보 보호책임자와 전용 문의 채널은 아직 승인되지 않았습니다. 웹사이트 공개 전 담당자 정보를 확정해야 합니다.</p><p>현재 확인 가능한 회사 대표전화: <a href={`tel:${siteConfig.telephone.replaceAll("-","")}`}>{siteConfig.telephone}</a></p></section>
</div></div></section></MarketingPage>}

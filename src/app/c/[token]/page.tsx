import { notFound } from "next/navigation";
import { DEMO_TOKEN, demoAgenda, recordEvent } from "@/server/demo/store";
import { listPublicAgendaAttachments } from "@/server/services/agenda-attachment-service";
import { getApprovedAgendaCostImpact } from "@/server/demo/fee-store";
import { getDemoCampaignRecord, campaignStateKo } from "@/server/demo/agenda-campaign-store";
import { ResponseService } from "@/server/services/response-service";
import { ResidentFlow } from "./resident-flow";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ token: string }> }) { const {token}=await params; if(token!==DEMO_TOKEN) notFound(); const campaign=getDemoCampaignRecord("hion-demo"); const now=new Date(); const existingReceipt=new ResponseService().getReceipt(token); if(!existingReceipt&&(campaign.status!=="OPEN"||now<new Date(campaign.startsAt)||now>new Date(campaign.endsAt))) return <main className="resident-container"><p className="pill">{campaignStateKo(campaign.status)}</p><h1>현재 응답할 수 없는 안건입니다</h1><section className="card"><p>안건 운영 상태 또는 응답 기간을 확인해 주세요.</p><dl><dt>응답 기간</dt><dd>{new Date(campaign.startsAt).toLocaleString("ko-KR")} ~ {new Date(campaign.endsAt).toLocaleString("ko-KR")}</dd></dl><p className="muted">이미 제출한 응답 영수증은 기존 초대 링크로 다시 확인할 수 있습니다. 문의는 관리사무소로 해 주세요.</p></section></main>; recordEvent("invite_opened"); const attachments=listPublicAgendaAttachments("demo-agenda"); const impact=getApprovedAgendaCostImpact("hion-demo"); const costImpact=impact?{estimatedProjectCost:impact.estimatedProjectCost.toString(),actualProjectCost:impact.actualProjectCost?.toString()??null,fundingSourceKo:impact.fundingSourceKo,usesLongTermRepairReserve:impact.usesLongTermRepairReserve,requiresAdditionalFee:impact.requiresAdditionalFee,allocationType:impact.allocationType,estimatedAmountPerUnit:impact.estimatedAmountPerUnit.toString(),expectedBillingStartMonth:impact.expectedBillingStartMonth,installmentCount:impact.installmentCount,residentExplanationKo:impact.residentExplanationKo}:null; return <ResidentFlow agenda={demoAgenda} token={token} attachments={attachments} costImpact={costImpact}/>; }

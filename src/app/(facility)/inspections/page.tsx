import { InspectionsPage } from "@/components/facility/inspections-page";

interface PageProps {
  searchParams: Promise<{ action?: string; assetId?: string; inspectionId?: string; period?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  return <InspectionsPage initialAction={params.action} initialAssetId={params.assetId} initialInspectionId={params.inspectionId} initialPeriod={params.period} />;
}

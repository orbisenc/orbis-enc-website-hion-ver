import { ReplacementDecisionPage } from "@/components/facility/replacement-decision-page";

export default async function ReplacementRoute({ searchParams }: { searchParams: Promise<{ assetId?: string }> }) {
  const { assetId } = await searchParams;
  return <ReplacementDecisionPage initialAssetId={assetId} />;
}

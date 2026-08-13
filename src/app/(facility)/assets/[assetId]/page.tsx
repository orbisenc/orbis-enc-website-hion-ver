import { AssetDetailPage } from "@/components/facility/asset-detail-page";
import { facilityRepository } from "@/services/facilityRepository";
import { notFound } from "next/navigation";

export default async function AssetRoute({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  const asset = await facilityRepository.getAsset(assetId);
  if (!asset) notFound();
  return <AssetDetailPage asset={asset} />;
}

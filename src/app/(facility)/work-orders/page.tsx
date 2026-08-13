import { WorkOrdersPage } from "@/components/facility/work-orders-page";

export default async function WorkOrdersRoute({ searchParams }: { searchParams: Promise<{ assetId?: string; orderId?: string }> }) {
  const { assetId, orderId } = await searchParams;
  return <WorkOrdersPage initialAssetId={assetId} initialOrderId={orderId} />;
}

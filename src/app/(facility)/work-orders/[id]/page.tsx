import { redirect } from "next/navigation";
export default async function WorkOrderDetailRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/work-orders?orderId=${encodeURIComponent(id)}`); }

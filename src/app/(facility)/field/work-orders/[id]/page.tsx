import { redirect } from "next/navigation";
export default async function FieldWorkOrderRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/work-orders?orderId=${encodeURIComponent(id)}`); }

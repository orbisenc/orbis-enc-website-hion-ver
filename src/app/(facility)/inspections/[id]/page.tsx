import { redirect } from "next/navigation";
export default async function InspectionDetailRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; redirect(`/inspections?inspectionId=${encodeURIComponent(id)}`); }

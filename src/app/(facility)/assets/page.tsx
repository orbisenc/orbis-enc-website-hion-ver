import { AssetsPage, type AssetFilters } from "@/components/facility/assets-page";

export default async function AssetsRoute({ searchParams }: { searchParams: Promise<AssetFilters> }) {
  return <AssetsPage initialFilters={await searchParams} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BranchDetailView } from "@/components/branches/branch-detail-view";
import { BRANCHES, getBranchBySlug } from "@/lib/constants";
import { InventoryService } from "@/lib/inventory-service";
import { getRoomsByBranch } from "@/lib/mock-rooms";
import { getLocalizedRooms } from "@/lib/i18n/room-localizer";

interface ArabicBranchPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: ArabicBranchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const branch = getBranchBySlug(slug);

  if (!branch) {
    return {
      title: "الفرع غير موجود | ضيافة فلاتيل",
      description: "استكشف فروع وشقق فلاتيل الفندقية في حيدر أباد.",
    };
  }

  return {
    title: `فرع ${branch.name} | ضيافة فلاتيل حيدر أباد`,
    description: `استكشف شقق فندقية مفروشة في فرع ضيافة فلاتيل ${branch.name}. ${branch.address}.`,
  };
}

export async function generateStaticParams() {
  return BRANCHES.map((b) => ({
    slug: b.slug,
  }));
}

export default async function ArabicBranchPage({ params }: ArabicBranchPageProps) {
  const { slug } = await params;
  const branch = getBranchBySlug(slug);

  if (!branch) {
    notFound();
  }

  const liveProperties = await InventoryService.getUnitsByBranch(branch.slug);
  const rawProperties = liveProperties.length > 0 ? liveProperties : getRoomsByBranch(branch.slug);
  const properties = getLocalizedRooms(rawProperties, "ar");

  return (
    <div className="min-h-screen bg-[#0E0A07] text-[#FAF4EB] flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178] font-arabic">
      <SiteHeader />
      <main className="flex-1 w-full">
        <BranchDetailView branch={branch} properties={properties} />
      </main>
      <SiteFooter />
    </div>
  );
}

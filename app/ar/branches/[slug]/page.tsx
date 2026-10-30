import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BranchDetailView } from "@/components/branches/branch-detail-view";
import { BRANCHES, getBranchBySlug } from "@/lib/constants";
import { InventoryService } from "@/lib/inventory-service";
import { getRoomsByBranch } from "@/lib/mock-rooms";
import { getLocalizedRooms } from "@/lib/i18n/room-localizer";
import { ARABIC_BRANCH_OVERLAYS } from "@/components/branch-hub";

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

  const overlay = ARABIC_BRANCH_OVERLAYS[slug];
  const name = overlay?.name || branch.name;
  const address = overlay?.address || branch.address;

  return {
    title: `فرع ${name} | ضيافة فلاتيل حيدر أباد`,
    description: `استكشف شقق فندقية مفروشة في فرع ضيافة فلاتيل ${name}. ${address}.`,
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
    <div className="min-h-screen bg-canvas text-fg flex flex-col selection:bg-gold/20 selection:text-gold font-arabic" dir="rtl">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        <BranchDetailView branch={branch} properties={properties} />
      </main>
      <SiteFooter />
    </div>
  );
}

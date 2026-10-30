import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BranchDetailView } from "@/components/branches/branch-detail-view";
import { BRANCHES, getBranchBySlug } from "@/lib/constants";
import { InventoryService } from "@/lib/inventory-service";
import { getRoomsByBranch } from "@/lib/mock-rooms";

interface BranchPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: BranchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const branch = getBranchBySlug(slug);

  if (!branch) {
    return {
      title: "Branch Not Found | Flatel Hospitality",
      description: "Explore Flatel Hospitality serviced branches in Hyderabad.",
    };
  }

  return {
    title: `${branch.name} Branch | Flatel Hospitality`,
    description: `Explore premium furnished flats at Flatel Hospitality ${branch.name}. ${branch.address}.`,
  };
}

export async function generateStaticParams() {
  return BRANCHES.map((b) => ({
    slug: b.slug,
  }));
}

export default async function BranchPage({ params }: BranchPageProps) {
  const { slug } = await params;
  const branch = getBranchBySlug(slug);

  if (!branch) {
    notFound();
  }

  const liveProperties = await InventoryService.getUnitsByBranch(branch.slug);
  const properties = liveProperties.length > 0 ? liveProperties : getRoomsByBranch(branch.slug);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-gold/20 selection:text-gold">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        <BranchDetailView branch={branch} properties={properties} />
      </main>
      <SiteFooter />
    </div>
  );
}

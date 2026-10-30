import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RoomDetailView } from "@/components/rooms/room-detail-view";
import { InventoryService } from "@/lib/inventory-service";
import { getRoomById } from "@/lib/mock-rooms";
import { getBranchBySlug } from "@/lib/constants";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomById(slug) || (await InventoryService.getUnitBySlug(slug));

  if (!room) {
    const branch = getBranchBySlug(slug);
    if (branch) {
      return {
        title: `${branch.name} Branch | Flatel Hospitality`,
        description: `Explore premium furnished flats at Flatel Hospitality ${branch.name}. ${branch.address}.`,
      };
    }
    return {
      title: "Property Not Found | Flatel Hospitality",
      description:
        "Explore our premium 1 BHK, 2 BHK, 3 BHK, and 4 BHK furnished residences in Hyderabad.",
    };
  }

  return {
    title: `${room.title} | Flatel Hospitality`,
    description: room.shortDescription,
  };
}

export async function generateStaticParams() {
  return [
    { slug: "1bhk" },
    { slug: "2bhk" },
    { slug: "3bhk" },
    { slug: "4bhk" },
  ];
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const room = (await InventoryService.getUnitBySlug(slug)) || getRoomById(slug);

  if (!room) {
    const branch = getBranchBySlug(slug);
    if (branch) {
      permanentRedirect(`/branches/${slug}`);
    }
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 w-full">
        <RoomDetailView room={room} requestedId={slug} />
      </main>
      <SiteFooter />
    </div>
  );
}

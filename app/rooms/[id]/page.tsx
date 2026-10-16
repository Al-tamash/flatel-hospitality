import { permanentRedirect } from "next/navigation";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [
    { id: "1bhk" },
    { id: "2bhk" },
    { id: "3bhk" },
    { id: "4bhk" },
  ];
}

/**
 * Legacy route redirect:
 * Canonicalizes /rooms/[id] traffic directly to /properties/[slug]
 */
export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  permanentRedirect(`/properties/${id}`);
}

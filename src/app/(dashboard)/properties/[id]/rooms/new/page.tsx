import type { Metadata } from "next";
import { CreateRoomForm } from "@/components/rooms/CreateRoomForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Add Room | DwellOS",
  description:
    "Configure room specifications, pricing in dollars, occupancy, and lease terms.",
};

export default async function NewRoomPage({ params }: PageProps) {
  const { id } = await params;
  return <CreateRoomForm propertyId={id} />;
}

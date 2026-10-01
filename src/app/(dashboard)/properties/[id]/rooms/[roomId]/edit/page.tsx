import type { Metadata } from "next";
import { EditRoomForm } from "@/components/rooms/EditRoomForm";

interface PageProps {
  params: Promise<{ id: string; roomId: string }>;
}

export const metadata: Metadata = {
  title: "Edit Room | DwellOS",
  description: "Modify room availability, occupancy limits, and pricing.",
};

export default async function EditRoomPage({ params }: PageProps) {
  const { id, roomId } = await params;
  return <EditRoomForm propertyId={id} roomId={roomId} />;
}

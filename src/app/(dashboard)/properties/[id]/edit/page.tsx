import type { Metadata } from "next";
import { EditPropertyForm } from "@/components/properties/EditPropertyForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Property | DwellOS",
  description: "Update property specifications, photos, and status.",
};

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  return <EditPropertyForm propertyId={id} />;
}

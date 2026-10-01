import type { Metadata } from "next";
import { CreatePropertyForm } from "@/components/properties/CreatePropertyForm";

export const metadata: Metadata = {
  title: "Create Property | DwellOS",
  description:
    "Add an apartment, house, PG, hostel, or residential unit to your DwellOS portfolio.",
};

export default function NewPropertyPage() {
  return <CreatePropertyForm />;
}

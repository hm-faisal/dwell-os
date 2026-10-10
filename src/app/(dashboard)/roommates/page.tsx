import type { Metadata } from "next";
import { Suspense } from "react";
import {
  RoommateContainer,
  RoommateSkeleton,
} from "@/components/roommates/RoommateContainer";

export const metadata: Metadata = {
  title: "Roommate Matching & Profiles | DwellOS",
  description:
    "Discover compatible roommates, compare lifestyle habits, and manage co-living shared unit approvals.",
};

export default function RoommatesPage() {
  return (
    <Suspense fallback={<RoommateSkeleton />}>
      <RoommateContainer />
    </Suspense>
  );
}

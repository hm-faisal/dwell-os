import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ExploreContainer,
  ExploreSkeleton,
} from "@/components/search/ExploreContainer";

export const metadata: Metadata = {
  title: "Explore Listings | DwellOS",
  description:
    "Search properties and rooms by location, price, move-in date, amenities, and roommate co-living preferences.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreContainer />
    </Suspense>
  );
}

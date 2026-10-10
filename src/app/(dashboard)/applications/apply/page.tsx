"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { RoomApplicationFlow } from "@/components/applications/RoomApplicationFlow";
import { roomsApi } from "@/lib/api";
import type { Room } from "@/types/room";

function ApplicationApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }

    // Attempt to fetch room details
    roomsApi
      .get(roomId)
      .then((res: Room) => {
        setRoom(res);
      })
      .catch(() => {
        // Fallback demo room context if ID is mock or not yet in DB
        setRoom({
          id: roomId,
          propertyId: "prop-demo-1",
          name: "En-suite Master Suite (Unit 3B)",
          type: "PRIVATE",
          furnishing: "FURNISHED",
          rent: 145000,
          deposit: 145000,
          status: "AVAILABLE",
          maxOccupants: 1,
          occupiedSlots: 0,
          minStayMonths: 6,
          size: 240,
          photos: [],
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-zinc-400">
        Loading room application details...
      </div>
    );
  }

  // Active target room
  const targetRoomId = room?.id || roomId || "room-default-101";
  const targetRoomName = room?.name || "Private En-Suite Room (Unit 4B)";
  const targetRentCents = room?.rent || 140000;
  const targetDepositCents = room?.deposit || targetRentCents;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link
          href="/explore"
          className="hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Explore Rooms
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">
          Rental Application
        </span>
      </div>

      <RoomApplicationFlow
        roomId={targetRoomId}
        roomName={targetRoomName}
        propertyName="DwellOS Verified Co-Living Residence"
        rentCents={targetRentCents}
        depositCents={targetDepositCents}
        onSuccess={() => {
          router.push("/roommates?tab=matches");
        }}
        onCancel={() => {
          router.back();
        }}
      />
    </div>
  );
}

export default function ApplicationApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-12 text-center text-xs text-zinc-400">
          Loading application...
        </div>
      }
    >
      <ApplicationApplyContent />
    </Suspense>
  );
}

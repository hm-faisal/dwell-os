"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getStoredToken, roommateMatchingApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { RoommateMatch, RoommateProfile } from "@/types/roommate";
import { CompatibilityBreakdownModal } from "./CompatibilityBreakdownModal";
import { ExpressInterestModal } from "./ExpressInterestModal";
import { RoommateApprovalVoteCard } from "./RoommateApprovalVoteCard";
import { RoommateMatchGrid } from "./RoommateMatchGrid";
import { RoommateProfileForm } from "./RoommateProfileForm";

export type RoommateTab = "matches" | "profile" | "approvals";

export function RoommateSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-1/3" />
      <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full max-w-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
      </div>
    </div>
  );
}

export function RoommateContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get("tab") as RoommateTab) || "matches";
  const [activeTab, setActiveTab] = useState<RoommateTab>(
    ["matches", "profile", "approvals"].includes(tabParam)
      ? tabParam
      : "matches",
  );

  const [profile, setProfile] = useState<RoommateProfile | null>(null);
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAuthToken, setHasAuthToken] = useState(true);

  // Modal states
  const [breakdownMatch, setBreakdownMatch] = useState<RoommateMatch | null>(
    null,
  );
  const [interestMatch, setInterestMatch] = useState<RoommateMatch | null>(
    null,
  );

  // Sync tab with URL
  const handleTabChange = useCallback(
    (tab: RoommateTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Load user profile and matches
  const loadData = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setHasAuthToken(false);
      setIsLoading(false);
      return;
    }
    setHasAuthToken(true);
    setIsLoading(true);

    try {
      const myProfile = await roommateMatchingApi.getMyProfile();
      setProfile(myProfile);

      if (myProfile) {
        const matchesRes = await roommateMatchingApi.getMatches({
          minScore: minScore > 0 ? minScore : undefined,
        });
        setMatches(matchesRes.items || []);
      } else {
        setMatches([]);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load roommate data";
      showToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [minScore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle interest updated callback
  const handleInterestSuccess = (updatedMatch: RoommateMatch) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)),
    );
  };

  // Demo co-approval applicant for showcase when backend unit approvals are empty
  const [sampleApprovals] = useState([
    {
      id: "demo-app-1",
      roomId: "sample-room-101",
      roomName: "Master Bedroom & En-Suite (Unit 4B)",
      applicationId: "app-shared-401",
      applicant: {
        id: "demo-user-marcus",
        name: "Marcus Vance",
        email: "marcus.v@example.com",
        profile: {
          id: "prf-marcus",
          userId: "demo-user-marcus",
          budgetMin: 120000,
          budgetMax: 160000,
          lifestyleTags: [
            "Tech Worker",
            "Gym Goer",
            "Non-Smoker",
            "Cooks Often",
          ],
          sleepSchedule: "EARLY_BIRD" as const,
          workSchedule: "HYBRID" as const,
          smoking: false,
          pets: false,
          cleanliness: "VERY_CLEAN" as const,
          bio: "Software developer moving to the area. I keep shared spaces spotless, enjoy quiet evenings, and meal prep on Sundays.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  ]);

  if (!hasAuthToken) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-2xl">
          👥
        </div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Sign In to Access Roommate Matching
        </h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Please log in or authenticate to create your co-living profile,
          explore compatibility scores, and submit room co-approvals.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/login")}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && !profile) {
    return <RoommateSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="purple" size="md">
              Co-Living & Matching
            </Badge>
            {profile && (
              <Badge variant="success" size="sm">
                ✓ Profile Active
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
            Roommate Profiles & Matching
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Discover compatible roommates using our transparent lifestyle
            matching engine, explore attribute breakdowns, and co-approve
            prospective tenants for shared units.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 backdrop-blur-md border border-black/5 dark:border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleTabChange("matches")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold tracking-[-0.01em] transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "matches"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
          >
            <span>Matches</span>
            {matches.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 font-bold">
                {matches.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("profile")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold tracking-[-0.01em] transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "profile"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
          >
            <span>My Profile</span>
            {!profile && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("approvals")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold tracking-[-0.01em] transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "approvals"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
          >
            <span>Unit Co-Approval</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "matches" && (
        <RoommateMatchGrid
          matches={matches}
          isLoading={isLoading}
          hasProfile={Boolean(profile)}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          onSetupProfile={() => handleTabChange("profile")}
          onViewBreakdown={(match: RoommateMatch) => setBreakdownMatch(match)}
          onExpressInterest={(match: RoommateMatch) => setInterestMatch(match)}
        />
      )}

      {activeTab === "profile" && (
        <div className="max-w-3xl mx-auto">
          <RoommateProfileForm
            initialProfile={profile}
            onSaved={(savedProfile: RoommateProfile) => {
              setProfile(savedProfile);
              // Refresh matches with updated profile
              roommateMatchingApi.getMatches().then((res) => {
                setMatches(res.items || []);
              });
              handleTabChange("matches");
            }}
          />
        </div>
      )}

      {activeTab === "approvals" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-2">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <span>🗳️</span>
              <span>Roommate Co-Approval Voting</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              When a unit is configured with a roommate co-approval policy,
              existing roommates must vote to accept or decline any prospective
              applicant before their lease can be finalized.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
              Pending Roommate Applications for Your Shared Unit
            </h3>

            {sampleApprovals.length > 0 ? (
              sampleApprovals.map((item) => (
                <RoommateApprovalVoteCard
                  key={item.id}
                  roomId={item.roomId}
                  roomName={item.roomName}
                  applicant={item.applicant}
                  applicationId={item.applicationId}
                />
              ))
            ) : (
              <div className="p-10 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  No Pending Co-Approval Votes
                </p>
                <p className="text-xs text-zinc-400">
                  When new applicants apply for open rooms in your shared unit,
                  their profiles will appear here for your review and vote.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explainable Match Breakdown Modal */}
      <CompatibilityBreakdownModal
        isOpen={Boolean(breakdownMatch)}
        onClose={() => setBreakdownMatch(null)}
        match={breakdownMatch}
        myProfile={profile}
        onOpenExpressInterest={() => {
          const m = breakdownMatch;
          setBreakdownMatch(null);
          if (m) setInterestMatch(m);
        }}
      />

      {/* Express Interest Modal */}
      <ExpressInterestModal
        isOpen={Boolean(interestMatch)}
        onClose={() => setInterestMatch(null)}
        targetMatch={interestMatch}
        onSuccess={handleInterestSuccess}
      />
    </div>
  );
}

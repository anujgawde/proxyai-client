"use client";

import { useEffect, useState } from "react";
import { Calendar, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { meetingsService } from "@/api/meetings";
import {
  MeetingListItem,
  MeetingsTab,
  MeetingsTabState,
} from "@/types/meetings";
import { checkProviderTokens } from "@/lib/utils";

const PAGE_SIZE = 10;

/* ---------------------------------- */
/* UI Components                      */
/* ---------------------------------- */

function ProviderConnectionCard({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full">
            <Video className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Connect Your Meeting Provider
          </h2>
          <p className="text-gray-600">
            Connect your calendar to start managing meetings
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={onConnect}
            className="bg-slate-900 hover:bg-slate-800"
          >
            Connect a Provider
          </Button>
          <p className="text-sm text-gray-500">
            You can disconnect at any time
          </p>
        </div>
      </div>
    </div>
  );
}

function MeetingsPageHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 w-full flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-sm text-gray-600">
          Manage and analyze your meetings
        </p>
      </div>

      <div>
        <Button onClick={() => meetingsService.syncMeetings()}>
          Sync Meetings
        </Button>
      </div>
    </div>
  );
}

function MeetingsTabs({
  activeTab,
  onChange,
}: {
  activeTab: MeetingsTab;
  onChange: (tab: MeetingsTab) => void;
}) {
  const tabs: { label: string; value: MeetingsTab }[] = [
    { label: "Upcoming", value: "upcoming" },
    { label: "Live", value: "live" },
    { label: "Past", value: "past" },
  ];

  return (
    <div className="flex gap-6 border-b border-gray-200 px-8 bg-white">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`py-4 text-sm font-medium hover:cursor-pointer ${
            activeTab === tab.value
              ? "border-b-2 border-black text-black"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- */
/* Main Page                          */
/* ---------------------------------- */

export default function MeetingsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<MeetingsTab>("upcoming");
  const [hasProviderToken, setHasProviderToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tabState, setTabState] = useState<
    Record<MeetingsTab, MeetingsTabState>
  >({
    upcoming: {
      meetings: [],
      page: 1,
      loading: false,
      hasMore: true,
      initialized: false,
    },
    live: {
      meetings: [],
      page: 1,
      loading: false,
      hasMore: true,
      initialized: false,
    },
    past: {
      meetings: [],
      page: 1,
      loading: false,
      hasMore: true,
      initialized: false,
    },
  });

  /* ---------------------------------- */
  /* Initialization                     */
  /* ---------------------------------- */

  useEffect(() => {
    if (!currentUser) return;

    const init = async () => {
      const providerStatus = checkProviderTokens();
      const hasAnyProvider =
        providerStatus.zoom ||
        providerStatus.google_meet ||
        providerStatus.teams;

      setHasProviderToken(hasAnyProvider);

      if (hasAnyProvider) {
        fetchMeetings("upcoming", 1);
      }
    };

    init();
  }, [currentUser]);

  /* ---------------------------------- */
  /* Lazy fetch per tab                 */
  /* ---------------------------------- */

  useEffect(() => {
    if (!hasProviderToken) return;

    const current = tabState[activeTab];
    if (!current.initialized && !current.loading) {
      fetchMeetings(activeTab, 1);
    }
  }, [activeTab, hasProviderToken]);

  /* ---------------------------------- */
  /* API Fetch                          */
  /* ---------------------------------- */

  const fetchMeetings = async (tab: MeetingsTab, page: number) => {
    setError(null);

    setTabState((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], loading: true },
    }));

    try {
      const statusMap = {
        upcoming: "scheduled",
        live: "live",
        past: "past",
      } as const;

      const data = await meetingsService.getMeetingsByStatus(statusMap[tab], {
        page,
        limit: PAGE_SIZE,
      });

      setTabState((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          meetings: page === 1 ? data : [...prev[tab].meetings, ...data],
          page,
          hasMore: data.length === PAGE_SIZE,
          initialized: true,
          loading: false,
        },
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to load meetings");
      setTabState((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], loading: false },
      }));
    }
  };

  /* ---------------------------------- */
  /* Render Guards                      */
  /* ---------------------------------- */

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!hasProviderToken) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <ProviderConnectionCard
          onConnect={() => router.push("/settings/providers")}
        />
      </div>
    );
  }

  const currentTab = tabState[activeTab];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <MeetingsPageHeader />
      <MeetingsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="p-8 space-y-6">
        {error && <p className="text-red-600 text-center">{error}</p>}

        {currentTab.loading && currentTab.meetings.length === 0 ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        ) : currentTab.meetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No meetings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentTab.meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-900 leading-tight">
                      {meeting.title}
                    </h3>

                    {/* Status pill */}
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {activeTab === "live"
                        ? "Live"
                        : activeTab === "upcoming"
                        ? "Upcoming"
                        : "Completed"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(meeting.startTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/*  Summaries Text */}
                  <div
                    className={` ${!meeting?.latestSummary ? `h-12` : "h-24"}`}
                  >
                    {meeting.latestSummary ? (
                      <div className="bg-green-50 rounded-md p-3 h-full flex flex-col overflow-y-auto">
                        <p className="text-xs font-medium text-green-700 mb-1 flex-shrink-0 ">
                          Latest Summary:
                        </p>
                        <p className="text-sm text-gray-700  line-clamp-3 flex-1 ">
                          {meeting.latestSummary}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-md p-3 h-full flex items-center justify-start">
                        <p className="text-sm text-gray-500 italic">
                          {meeting.status === "scheduled"
                            ? "Meeting not started yet."
                            : meeting.status === "past"
                            ? "Meeting has ended."
                            : "Generating summaries..."}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <Button className="w-full" size="sm" variant="outline">
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentTab.hasMore && !currentTab.loading && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => fetchMeetings(activeTab, currentTab.page + 1)}
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

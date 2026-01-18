"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Clock, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { meetingsService } from "@/api/meetings";
import {
  MeetingListItem,
  MeetingsTab,
  MeetingsTabState,
  MeetingStatus,
  Summary,
} from "@/types/meetings";
import { checkProviderTokens } from "@/lib/utils";
import ViewDetailsDialog from "@/components/meetings/ViewDetailsDialog";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 10;
interface SSEMessage {
  userId: string;
  type:
    | "connected"
    | "heartbeat"
    | "meeting_status_update"
    | "transcript_update"
    | "summary_update";
  data?: any;
  message?: string;
  timestamp: string;
}

interface TranscriptUpdateData {
  speaker_name: string;
  speaker_uuid: string;
  speaker_user_uuid: string;
  speaker_is_host: boolean;
  timestamp_ms: number;
  duration_ms: number;
  transcription: {
    transcript: string;
    words: number;
  };
}

/* ---------------------------------- */
/* UI Components                      */
/* ---------------------------------- */

function ProviderConnectionCard({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Connect Your Calendar
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
            Connect Calendar
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
        {/* Todo: This will open a dialog, which will prompt the user to fill in all the details according to the meeting provider selected */}
        <Button className="">Schedule Meeting</Button>
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
    { label: "Scheduled", value: "scheduled" },
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

  const [activeTab, setActiveTab] = useState<MeetingsTab>("scheduled");
  const statusToTab: Record<MeetingStatus, MeetingsTab> = {
    scheduled: "scheduled",
    live: "live",
    past: "past",
    cancelled: "past",
    no_show: "past",
  };
  const [hasProviderToken, setHasProviderToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openMeeting, setOpenMeeting] = useState<MeetingListItem | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SSE Connection - handlers moved inside useEffect to capture latest state
  useEffect(() => {
    if (!currentUser?.firebaseUid) {
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `${process.env.API_BASE_URL}/meetings/sse?userId=${currentUser.firebaseUid}`,
      { withCredentials: true }
    );

    eventSource.onopen = () => {
      setConnectionStatus("connected");

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);

        switch (message.type) {
          case "meeting_status_update":
            if (!message.data) break;

            // Use functional update to avoid stale state
            setTabState((prev) => {
              const { id, status } = message.data;
              let fromTab: MeetingsTab | null = null;
              let meeting: MeetingListItem | null = null;

              // Find meeting in any tab
              (Object.keys(prev) as MeetingsTab[]).forEach((tab) => {
                const found = prev[tab].meetings.find((m) => m.id === id);
                if (found) {
                  fromTab = tab;
                  meeting = found;
                }
              });

              if (!fromTab || !meeting) return prev;

              const targetTab: MeetingsTab =
                statusToTab[status as MeetingStatus];
              const sourceState: MeetingsTabState = prev[fromTab]!;
              const targetState: MeetingsTabState = prev[targetTab]!;

              // Same tab - just update status
              if (fromTab === targetTab) {
                return {
                  ...prev,
                  [fromTab]: {
                    ...sourceState,
                    meetings: sourceState.meetings.map((m) =>
                      m.id === id ? { ...m, status } : m
                    ),
                  },
                };
              }

              // Different tab - move meeting
              return {
                ...prev,
                [fromTab]: {
                  ...sourceState,
                  meetings: sourceState.meetings.filter((m) => m.id !== id),
                },
                [targetTab]: {
                  ...(targetState as MeetingsTabState),
                  meetings: [
                    { ...(meeting as MeetingListItem), status },
                    ...(targetState?.meetings || []),
                  ],
                },
              };
            });
            break;

          case "summary_update":
            if (!message.data) break;

            setTabState((prev) => {
              const summary = message.data as Summary;
              const updatedState = { ...prev };

              (Object.keys(updatedState) as MeetingsTab[]).forEach((tab) => {
                updatedState[tab] = {
                  ...updatedState[tab],
                  meetings: updatedState[tab].meetings.map((meeting) => {
                    if (meeting.id === summary.meetingId) {
                      return {
                        ...meeting,
                        latestSummary: summary.content,
                      };
                    }
                    return meeting;
                  }),
                };
              });

              return updatedState;
            });
            break;

          case "transcript_update":
            // Transcripts only handled in ViewDetailsDialog
            console.log(
              "Transcript update received (handled by ViewDetailsDialog)"
            ); // DEBUG LOG
            break;

          case "connected":
          case "heartbeat":
            break;

          default:
            console.warn("Unknown SSE event type:", message.type);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setConnectionStatus("disconnected");
      eventSource.close();

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect...");
        // Trigger re-render by updating a state value
        setConnectionStatus("connecting");
      }, 3000);
    };

    eventSourceRef.current = eventSource;

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [currentUser?.firebaseUid]); // Depend only on firebaseUid, not entire object

  const viewDetailsHandler = (meetingId: number) => {
    const openMeeting = tabState[activeTab].meetings.filter(
      (meeting: MeetingListItem) => meeting.id === meetingId
    );

    setOpenMeeting(openMeeting[0]);
  };

  const [tabState, setTabState] = useState<
    Record<MeetingsTab, MeetingsTabState>
  >({
    scheduled: {
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
        providerStatus.google ||
        providerStatus.microsoft;

      setHasProviderToken(hasAnyProvider);

      if (hasAnyProvider) {
        fetchMeetings("scheduled", 1);
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

  const fetchMeetings = async (tab: MeetingsTab, page: number) => {
    setError(null);

    setTabState((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], loading: true },
    }));

    try {
      const data = await meetingsService.getMeetingsByStatus(tab, {
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
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow relative"
              >
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between min-w-0">
                      {/* Title */}
                      <h3 className="text-base font-semibold text-gray-900 leading-tight truncate">
                        {meeting.title}
                      </h3>

                      {/* Status pill */}
                      <Badge
                        className={`capitalize ${
                          meeting.status === "live"
                            ? "bg-red-50 text-red-700 border-red-200 text-xs"
                            : meeting.status === "scheduled"
                            ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            : "bg-gray-50 text-gray-700 border-gray-200 text-xs"
                        }`}
                      >
                        {meeting.status}
                      </Badge>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 flex space-x-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {new Date(meeting.startTime).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>
                              {new Date(meeting.startTime).toLocaleTimeString(
                                [],
                                { hour: "numeric", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600  min-w-0">
                          <img
                            src={
                              meeting.meetingProvider === "google_meet"
                                ? "meetings/googlemeet-logo.svg"
                                : meeting.meetingProvider === "teams"
                                ? "meetings/teams-logo.svg"
                                : "meetings/zoom-logo.svg"
                            }
                            className="h-4 w-4"
                          />

                          <a
                            className="underline truncate"
                            href={meeting.meetingUrl}
                          >
                            {meeting.meetingUrl}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/*  Summaries Text */}
                    <div>
                      {meeting.latestSummary ? (
                        <div className="bg-green-50 rounded-md p-3 h-full flex flex-col overflow-y-auto">
                          <p className="text-xs font-medium text-green-700 mb-1 flex shrink-0">
                            Latest Summary:
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-3 flex-1 ">
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
                  </div>
                  <div className="w-full py-2">
                    <Button
                      onClick={() => viewDetailsHandler(meeting.id)}
                      className="w-full"
                      size="sm"
                      variant="outline"
                    >
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

        {openMeeting && (
          <ViewDetailsDialog
            isOpen={!!openMeeting}
            meeting={openMeeting}
            currentUser={currentUser}
            onClose={() => setOpenMeeting(null)}
          />
        )}
      </div>
    </div>
  );
}

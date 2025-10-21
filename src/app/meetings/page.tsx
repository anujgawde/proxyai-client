"use client";

import { CreateMeetingDialog } from "@/components/meetings/CreateMeetingDialog";
import MeetingsPageHeader from "@/components/meetings/MeetingsPageHeader";
import { useState, useEffect } from "react";
import { meetingsService } from "@/api/meetings";
import { MeetingListItem } from "@/types/meetings";
import { Calendar, Users, Loader2, Clock, Eye, Radio } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { socketService } from "@/lib/socket";
import ViewDetailsDialog from "@/components/meetings/ViewDetailsDialog";

export default function MeetingsPage() {
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] =
    useState(false);
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingListItem | null>(null);
  const router = useRouter();

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetingsService.getMyMeetings();
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load meetings");
      console.error("Error fetching meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Initialize socket
  useEffect(() => {
    if (!currentUser?.email) return;

    socketService.initialize(currentUser.email);
  }, [currentUser?.email]);

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    console.log("Setting up socket listeners for meetings page");

    const handleMeetingStarted = (updatedMeeting: any) => {
      console.log("Meeting started:", updatedMeeting);
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === updatedMeeting.id ? { ...m, ...updatedMeeting } : m
        )
      );
    };

    const handleMeetingEnded = (updatedMeeting: any) => {
      console.log("Meeting ended:", updatedMeeting);
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === updatedMeeting.id ? { ...m, ...updatedMeeting } : m
        )
      );
    };

    const handleNewTranscript = (entry: any) => {
      console.log("New transcript entry received:", entry);
      // Optionally update meeting transcript count or show notification
    };

    socketService.on("meeting-started", handleMeetingStarted);
    socketService.on("meeting-ended", handleMeetingEnded);
    socketService.on("new-transcript", handleNewTranscript);

    return () => {
      socketService.off("meeting-started", handleMeetingStarted);
      socketService.off("meeting-ended", handleMeetingEnded);
      socketService.off("new-transcript", handleNewTranscript);
    };
  }, []);

  const handleJoinMeeting = (meetingId: number) => {
    console.log("Joining meeting:", meetingId);
    router.push(`/meetings/${meetingId}`);
  };

  const handleViewDetails = (meeting: MeetingListItem) => {
    // TODO: Implement view details logic
    setSelectedMeeting(meeting);
  };

  const canJoinMeeting = (meeting: MeetingListItem) => {
    if (!currentUser) return false;
    return (
      (meeting.status === "ongoing" || meeting.status === "scheduled") &&
      meeting.participants.includes(currentUser.email!)
    );
  };

  const getDuration = (meeting: MeetingListItem) => {
    if (!meeting.startedAt) return "Not started";

    const start = new Date(meeting.startedAt);
    const end = meeting.endedAt ? new Date(meeting.endedAt) : new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // const getLatestSummary = (meeting: Meeting) => {
  //   if (!meeting.summaries || meeting.summaries.length === 0)
  //     return "No summaries yet...";
  //   const latest = meeting.summaries[meeting.summaries.length - 1];
  //   if (!latest) return "No summaries yet...";
  //   return latest.content.substring(0, 100) + "...";
  // };

  return (
    <div>
      {/* Header Section */}
      <MeetingsPageHeader
        setIsCreateMeetingDialogOpen={setIsCreateMeetingDialogOpen}
      />

      <CreateMeetingDialog
        isCreateMeetingDialogOpen={isCreateMeetingDialogOpen}
        setIsCreateMeetingDialogOpen={setIsCreateMeetingDialogOpen}
        onMeetingCreated={fetchMeetings}
      />

      {/* Meetings List */}
      <div className="p-8">
        {loading || !socketService.getConnectionStatus() ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMeetings}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No meetings scheduled
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by scheduling your first meeting
            </p>
          </div>
        ) : (
          <div className="flex items-start w-full">
            {meetings.map((meeting) => {
              const scheduledStart = new Date(meeting.scheduledStart);
              const scheduledEnd = new Date(meeting.scheduledEnd);

              const scheduledOnParts = meeting.scheduledOn.split("-");
              const scheduledOn = new Date(
                parseInt(scheduledOnParts[0]),
                parseInt(scheduledOnParts[1]) - 1,
                parseInt(scheduledOnParts[2])
              );

              return (
                <Card
                  key={meeting.id}
                  className="border-gray-200 shadow-md w-1/4 gap-0"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <CardTitle className="text-lg font-semibold min-w-0 pr-2">
                        {meeting.title}
                      </CardTitle>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          meeting.status === "ongoing"
                            ? "bg-red-100 text-red-800"
                            : meeting.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {meeting.status === "ongoing" ? (
                          <>
                            <Radio className="w-2 h-2 mr-1 animate-pulse" />
                            Live
                          </>
                        ) : meeting.status === "scheduled" ? (
                          "Scheduled"
                        ) : (
                          "Ended"
                        )}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Date and Time */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{format(scheduledOn, "MMM d, yyyy")}</span>
                      </div>

                      {/* Time Range */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {format(scheduledStart, "h:mm a")} -{" "}
                          {format(scheduledEnd, "h:mm a")}
                        </span>
                      </div>

                      {/* Participants Count */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {meeting.participants.length} participant(s)
                        </span>
                      </div>

                      {/* Duration for started/ended meetings */}
                      {meeting.startedAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Duration: {getDuration(meeting)}</span>
                        </div>
                      )}

                      <div className="space-y-3 mb-4">
                        {/* Latest Summary Preview */}
                        {meeting.latestSummary && (
                          <div className="bg-green-50 rounded-md p-3">
                            <p className="text-xs font-medium text-green-700 mb-1">
                              Latest Summary:
                            </p>
                            <p className="text-sm text-gray-700">
                              {meeting.latestSummary}
                            </p>
                          </div>
                        )}

                        {/* No content message */}
                        {!meeting.latestSummary && (
                          <div className="bg-gray-50 rounded-md p-3">
                            <p className="text-sm text-gray-500 italic">
                              {meeting.status === "scheduled"
                                ? "Meeting not started yet"
                                : "No summaries found."}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {canJoinMeeting(meeting) && (
                          <Button
                            onClick={() => handleJoinMeeting(meeting.id)}
                            className={`flex-1 ${
                              meeting.status === "ongoing" &&
                              "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                            size="sm"
                            variant="outline"
                          >
                            {meeting.status === "ongoing" && (
                              <Radio className="h-3 w-3 mr-1" />
                            )}
                            Join Meeting
                          </Button>
                        )}

                        {meeting.status === "ended" && (
                          <Button
                            onClick={() => handleViewDetails(meeting)}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full">
        {selectedMeeting && (
          <ViewDetailsDialog
            meeting={selectedMeeting}
            isOpen={!!selectedMeeting}
            onClose={() => {
              setSelectedMeeting(null);
            }}
            currentUser={currentUser!}
          />
        )}
      </div>
    </div>
  );
}

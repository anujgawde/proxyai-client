"use client";

import { CreateMeetingDialog } from "@/components/meetings/CreateMeetingDialog";
import MeetingsPageHeader from "@/components/meetings/MeetingsPageHeader";
import { useState, useEffect } from "react";
import { meetingsService } from "@/api/meetings";
import { Meeting } from "@/types/meetings";
import { Calendar, Users, Loader2, Clock, Eye, Radio } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function MeetingsPage() {
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] =
    useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

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

  const handleJoinMeeting = (meetingId: number) => {
    console.log("Joining meeting:", meetingId);
    router.push(`meetings/${meetingId}`);
    // TODO: Implement join meeting logic (connect with sockets/api)
  };

  const handleViewDetails = (meetingId: number) => {
    console.log("Viewing meeting details:", meetingId);
    // TODO: Implement view details logic (Open dialog which displays transcripts, summaries and allows QnA with RAG Model)
  };

  const canJoinMeeting = (meeting: Meeting) => {
    if (!currentUser) return false;
    return (
      (meeting.status === "ongoing" || meeting.status === "scheduled") &&
      meeting.participants.includes(currentUser.email!)
    );
  };

  const getDuration = (meeting: Meeting) => {
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
      <div className="container mx-auto px-4 py-8">
        {loading ? (
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => {
              const scheduledStart = new Date(meeting.scheduledStart);
              const scheduledEnd = new Date(meeting.scheduledEnd);

              // Quick Fix to display correct date. Displaying t - 1 date otherwise.
              const scheduledOnParts = meeting.scheduledOn.split("-");
              const scheduledOn = new Date(
                parseInt(scheduledOnParts[0]),
                parseInt(scheduledOnParts[1]) - 1,
                parseInt(scheduledOnParts[2])
              );

              return (
                <Card key={meeting.id} className="border-gray-200 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-semibold flex-1 min-w-0 pr-2">
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

                      {/* Meeting Room */}
                      {meeting.meetingRoomName && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                            🏠
                          </div>
                          <span className="truncate">
                            {meeting.meetingRoomName}
                          </span>
                        </div>
                      )}

                      {/* Duration for started/ended meetings */}
                      {meeting.startedAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Duration: {getDuration(meeting)}</span>
                        </div>
                      )}

                      {/* Participants List */}
                      {meeting.participants.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">
                            Participants:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {meeting.participants
                              .slice(0, 3)
                              .map((email, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  {email}
                                </span>
                              ))}
                            {meeting.participants.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                +{meeting.participants.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
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
                            onClick={() => handleViewDetails(meeting.id)}
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
    </div>
  );
}

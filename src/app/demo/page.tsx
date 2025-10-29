"use client";
import { useState, useEffect } from "react";
import { Calendar, Users, Clock, Eye, Radio, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DemoViewDetailsDialog from "../../components/demo/DemoViewDetailsDialog";
// import {
//   MEETING_TRANSCRIPTS,
//   MEETING_SUMMARIES,
//   MEETING_CONFIGS,
// } from "../../lib/demo-data";
import DemoGuideDialog from "@/components/demo/DemoGuideDialog";
import { get } from "@vercel/edge-config";

interface DemoMeeting {
  id: number;
  title: string;
  status: "scheduled" | "ongoing" | "ended";
  scheduledOn: string;
  scheduledStart: string;
  scheduledEnd: string;
  participants: string[];
  startedAt: string | null;
  endedAt: string | null;
  latestSummary: string | null;
}

interface TranscriptData {
  id: string;
  speakerName: string;
  speakerEmail: string;
  text: string;
  timestamp: string;
}

interface Summary {
  id: number;
  content: string;
  createdAt: string;
}

export interface MeetingConfig {
  id: number;
  title: string;
  participants: string[];
}

const MEETING_TRANSCRIPTS: Record<
  number,
  Array<{ speakerName: string; speakerEmail: string; text: string }>
> = (await get("MEETING_TRANSCRIPTS")) || [];
const MEETING_SUMMARIES: Record<number, string[]> =
  (await get("MEETING_SUMMARIES")) || [];
const MEETING_CONFIGS: MeetingConfig[] = (await get("MEETING_CONFIGS")) || [];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};

export default function DemoMeetingsPage() {
  const [meetings, setMeetings] = useState<DemoMeeting[]>(
    MEETING_CONFIGS.map((config, index) => {
      const startHour = 14 + Math.floor(index / 4);
      const startMinute = (index % 4) * 15;

      // Calculate end time properly (25 minutes after start)
      let endHour = startHour;
      let endMinute = startMinute + 25;
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }

      const formatTimeString = (h: number, m: number) =>
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

      return {
        ...config,
        status: "scheduled" as const,
        scheduledOn: "2025-10-27",
        scheduledStart: `2025-10-27T${formatTimeString(
          startHour,
          startMinute
        )}:00`,
        scheduledEnd: `2025-10-27T${formatTimeString(endHour, endMinute)}:00`,
        startedAt: null,
        endedAt: null,
        latestSummary: null,
      };
    })
  );
  const [selectedMeeting, setSelectedMeeting] = useState<DemoMeeting | null>(
    null
  );
  const [meetingDurations, setMeetingDurations] = useState<
    Record<number, number>
  >({});
  const [meetingTranscripts, setMeetingTranscripts] = useState<
    Record<number, TranscriptData[]>
  >({});
  const [meetingSummaries, setMeetingSummaries] = useState<
    Record<number, Summary[]>
  >({});
  const [transcriptIndexes, setTranscriptIndexes] = useState<
    Record<number, number>
  >({});
  const [summaryIndexes, setSummaryIndexes] = useState<Record<number, number>>(
    {}
  );

  useEffect(() => {
    const ongoingMeetings = meetings.filter((m) => m.status === "ongoing");
    if (ongoingMeetings.length === 0) return;

    const interval = setInterval(() => {
      setMeetingDurations((prev) => {
        const updated = { ...prev };
        ongoingMeetings.forEach((meeting) => {
          updated[meeting.id] = (updated[meeting.id] || 0) + 1;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [meetings]);

  useEffect(() => {
    const ongoingMeetings = meetings.filter((m) => m.status === "ongoing");
    if (ongoingMeetings.length === 0) return;

    const intervals = ongoingMeetings.map((meeting) => {
      return setInterval(() => {
        const currentIndex = transcriptIndexes[meeting.id] || 0;
        const meetingTranscriptList = MEETING_TRANSCRIPTS[meeting.id] || [];

        if (currentIndex < meetingTranscriptList.length) {
          const transcript = meetingTranscriptList[currentIndex];
          const newTranscript: TranscriptData = {
            id: `transcript-${meeting.id}-${Date.now()}-${currentIndex}`,
            speakerName: transcript.speakerName,
            speakerEmail: transcript.speakerEmail,
            text: transcript.text,
            timestamp: new Date().toISOString(),
          };

          setMeetingTranscripts((prev) => ({
            ...prev,
            [meeting.id]: [...(prev[meeting.id] || []), newTranscript],
          }));

          setTranscriptIndexes((prev) => ({
            ...prev,
            [meeting.id]: currentIndex + 1,
          }));
        } else {
          const summaryList = MEETING_SUMMARIES[meeting.id] || [];
          const summaryIndex = summaryIndexes[meeting.id] || 0;

          if (summaryIndex >= summaryList.length) {
            setMeetings((prev) =>
              prev.map((m) =>
                m.id === meeting.id
                  ? {
                      ...m,
                      status: "ended" as const,
                      endedAt: new Date().toISOString(),
                    }
                  : m
              )
            );
          }
        }
      }, 6000);
    });

    return () => intervals.forEach(clearInterval);
  }, [meetings, transcriptIndexes, summaryIndexes]);

  useEffect(() => {
    const ongoingMeetings = meetings.filter((m) => m.status === "ongoing");
    if (ongoingMeetings.length === 0) return;

    const intervals = ongoingMeetings.map((meeting) => {
      return setInterval(() => {
        const currentIndex = summaryIndexes[meeting.id] || 0;
        const meetingSummaryList = MEETING_SUMMARIES[meeting.id] || [];

        if (currentIndex < meetingSummaryList.length) {
          const newSummary: Summary = {
            id: Date.now() + meeting.id + currentIndex,
            content: meetingSummaryList[currentIndex],
            createdAt: new Date().toISOString(),
          };

          setMeetingSummaries((prev) => ({
            ...prev,
            [meeting.id]: [...(prev[meeting.id] || []), newSummary],
          }));

          setMeetings((prev) =>
            prev.map((m) =>
              m.id === meeting.id
                ? { ...m, latestSummary: newSummary.content }
                : m
            )
          );

          setSummaryIndexes((prev) => ({
            ...prev,
            [meeting.id]: currentIndex + 1,
          }));
        }
      }, 30000);
    });

    return () => intervals.forEach(clearInterval);
  }, [meetings, summaryIndexes]);

  const handleStartMeeting = (meetingId: number) => {
    const now = new Date().toISOString();
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              status: "ongoing" as const,
              startedAt: now,
              latestSummary: null,
            }
          : m
      )
    );
    setMeetingDurations((prev) => ({ ...prev, [meetingId]: 0 }));
    setMeetingTranscripts((prev) => ({ ...prev, [meetingId]: [] }));
    setMeetingSummaries((prev) => ({ ...prev, [meetingId]: [] }));
    setTranscriptIndexes((prev) => ({ ...prev, [meetingId]: 0 }));
    setSummaryIndexes((prev) => ({ ...prev, [meetingId]: 0 }));
  };

  const handleViewDetails = (meeting: DemoMeeting) => {
    setSelectedMeeting(meeting);
  };

  const getDuration = (meetingId: number, startedAt: string | null) => {
    if (!startedAt) return "Not started";
    const duration = meetingDurations[meetingId] || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const renderMeetingCard = (meeting: DemoMeeting) => {
    return (
      <Card
        key={meeting.id}
        className="border-gray-200 shadow-md w-full flex flex-col"
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
                  : meeting.status === "ended"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {meeting.status === "ongoing" ? (
                <>
                  <Radio className="w-2 h-2 mr-1 animate-pulse" />
                  Live
                </>
              ) : meeting.status === "ended" ? (
                "Ended"
              ) : (
                "Scheduled"
              )}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatDate(meeting.scheduledOn)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {formatTime(meeting.scheduledStart)} -{" "}
                {formatTime(meeting.scheduledEnd)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{meeting.participants.length} participant(s)</span>
            </div>
            {meeting.startedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Duration: {getDuration(meeting.id, meeting.startedAt)}
                </span>
              </div>
            )}
            <div className={` ${!meeting?.latestSummary ? `h-12` : "h-24"}`}>
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
                      : meeting.status === "ended"
                      ? "Meeting has ended."
                      : "Generating summaries..."}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {meeting.status === "scheduled" && (
              <Button
                onClick={() => handleStartMeeting(meeting.id)}
                className="flex-1 bg-slate-900 hover:bg-slate-800"
                size="sm"
              >
                <Play className="h-3 w-3 mr-1" />
                Start Meeting
              </Button>
            )}
            {(meeting.status === "ongoing" || meeting.status === "ended") && (
              <Button
                onClick={() => handleViewDetails(meeting)}
                variant="outline"
                size="sm"
                className="flex-1 h-8"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ongoingMeetings = meetings.filter((m) => m.status === "ongoing");
  const scheduledMeetings = meetings.filter((m) => m.status === "scheduled");
  const endedMeetings = meetings.filter((m) => m.status === "ended");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="space-y-8">
          {ongoingMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-600 animate-pulse" />
                Ongoing Meetings ({ongoingMeetings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ongoingMeetings.map(renderMeetingCard)}
              </div>
            </div>
          )}
          {scheduledMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Scheduled Meetings ({scheduledMeetings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scheduledMeetings.map(renderMeetingCard)}
              </div>
            </div>
          )}
          {endedMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Ended Meetings ({endedMeetings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {endedMeetings.map(renderMeetingCard)}
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedMeeting && (
        <DemoViewDetailsDialog
          meeting={selectedMeeting}
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          transcripts={meetingTranscripts[selectedMeeting.id] || []}
          summaries={meetingSummaries[selectedMeeting.id] || []}
        />
      )}

      <DemoGuideDialog autoOpen={true} />
    </div>
  );
}

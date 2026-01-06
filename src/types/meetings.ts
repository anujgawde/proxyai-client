// Main Meeting Interface:
export type Meeting = {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  duration?: number;
  status: "scheduled" | "live" | "past";
  meetingUrl: string;
  provider: "zoom" | "google_meet" | "teams";
  organizerId?: string;
  expectedParticipants?: number;
  presentParticipants?: number;
  providerMetadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

// Meetings List:
export type MeetingListItem = Pick<
  Meeting,
  | "id"
  | "title"
  | "startTime"
  | "endTime"
  | "duration"
  | "status"
  | "meetingUrl"
  | "provider"
> & {
  latestSummary: string;
};

export type MeetingStatus =
  | "scheduled"
  | "live"
  | "past"
  | "no_show"
  | "cancelled";

export type MeetingsTab = "scheduled" | "live" | "past";

export type MeetingsTabState = {
  meetings: MeetingListItem[];
  page: number;
  loading: boolean;
  hasMore: boolean;
  initialized: boolean;
};

// Todo: Replace TranscriptData with TranscriptSegment
export interface TranscriptData {
  speakerEmail: string;
  speakerName: string;
  text: string;
  timestamp: string;
}
// Transcript:
export interface TranscriptEntry {
  id: number;

  transcript: TranscriptData[];

  meetingId: number;

  timeStart: string; // ISO String
  timeEnd: string;
}

// Summary:
export interface Summary {
  id: number;
  content: string;
  meetingId: number;
  createdAt: string;
}

// Todo: Verify usage. Not finalized.
export interface QAEntry {
  // Temp Fix: Since there is no id on QAEntry when its status is 'question-status' because entry isn't stored in db until then.
  id: number | string;
  userId: string;
  meetingId: string;
  speakerName: string;
  speakerEmail: string;

  question: string;
  answer: string;

  timestamp: string;

  status?: "asking" | "answered" | "error";
  sources?: string[];
}

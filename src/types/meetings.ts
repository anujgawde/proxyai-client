// Main Meeting Interface:
export interface Meeting {
  id: number;
  title: string;
  participants: string[];
  createdBy: string;
  scheduledOn: string;
  scheduledStart: string;
  scheduledEnd: string;
  startedAt?: string;
  endedAt?: string;
  status: "scheduled" | "ongoing" | "ended";
  meetingRoomName: string;
  createdAt: string;
  updatedAt: string;
}

// Meetings List:
export type MeetingListItem = Pick<
  Meeting,
  | "id"
  | "title"
  | "scheduledOn"
  | "scheduledStart"
  | "scheduledEnd"
  | "status"
  | "startedAt"
  | "endedAt"
  | "participants"
> & {
  latestSummary: string;
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

  meetingId: string;

  timeStart: string; // ISO String
  timeEnd: string;
}

// Summary:
export interface Summary {
  id: number;
  content: string;
  meetingId: string;
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

// Data Transfer Objects:
export interface CreateMeetingDto {
  title: string;
  participants: string[];
  scheduledOn: string; // ISO date string (date only)
  scheduledStart: string; // ISO datetime string
  scheduledEnd: string; // ISO datetime string
}

export interface UpdateMeetingDto {
  title?: string;
  participants?: string[];
  scheduledOn?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  status?: "scheduled" | "ongoing" | "ended";
}

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

// Transcript:
export interface TranscriptEntry {
  id: number;
  speaker: string;
  text: string;
  timestamp: Date;
  meetingId: string;
  createdAt: Date;
}

// Summary:
export interface Summary {
  id: number;
  timestamp: string;
  content: string;
  meetingId: string;
  createdAt: Date;
}

// Todo: Verify usage. Not finalized.
export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  meetingId: string;
  userId: string;
  userEmail?: string;
  status?: "asking" | "answered" | "error";
  sources?: any[];
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

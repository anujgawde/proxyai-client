export interface UpdateMeetingDto {}

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

export interface Meeting {
  id: number;
  title: string;
  participants: string[];
  createdBy: string;
  scheduledOn: string; // ISO date string (date only)
  scheduledStart: string; // ISO datetime string
  scheduledEnd: string; // ISO datetime string
  startedAt?: string;
  endedAt?: string;
  status: "scheduled" | "ongoing" | "ended";
  meetingRoomName: string;
  createdAt: string;
  updatedAt: string;
  transcript?: Array<{
    speaker: string;
    text: string;
    timestamp: string;
  }>;
  summaries?: Array<{
    content: string;
    timestamp: string;
  }>;
}

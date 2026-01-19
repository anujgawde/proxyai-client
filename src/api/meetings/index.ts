import { MeetingStatus, QAEntry, Summary } from "@/types/meetings";
import { api } from "../api";

class MeetingsService {
  async getMeetingsByStatus(
    status: MeetingStatus,
    params?: { page?: number; limit?: number }
  ) {
    const response = await api.get("/meetings", {
      params: {
        status,
        ...params,
      },
    });
    return response.data;
  }

  // Trigger server-side meeting sync (tokens are managed server-side)
  async syncMeetings() {
    const response = await api.post("/meetings/sync", {});
    return response.data;
  }

  async getMeetingById(id: string) {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  }

  async getMeetingSummaries(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Summary[];
    pagination: {
      page: number;
      limit: number;
      totalSummaries: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const response = await api.get(
      `/meetings/${id}/summaries?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getMeetingTranscriptSegments(
    meetingId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const response = await api.get(
      `/meetings/${meetingId}/transcript-segments`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  async getQAHistory(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: QAEntry[];
    pagination: {
      page: number;
      limit: number;
      totalQA: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const response = await api.get(
      `/meetings/${id}/qa-history?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async askQuestion(meetingId: string, question: string): Promise<QAEntry> {
    const response = await api.post(`/meetings/${meetingId}/ask-question`, {
      question,
    });
    return response.data;
  }

  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
  /* Temporarily Removed APIs Seperated.                  */
  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
  /* ---------------------------------------------------- */
}

export const meetingsService = new MeetingsService();

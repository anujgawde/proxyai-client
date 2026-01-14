import { MeetingStatus, QAEntry, Summary } from "@/types/meetings";
import { api } from "../api";
import { STORAGE_KEYS } from "@/config";

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

  // Temporary: This method is for testing purposes only. Meetings will only be synced from the server.
  async syncMeetings() {
    const headers: Record<string, string> = {};

    const zoomToken = localStorage.getItem(STORAGE_KEYS.ZOOM_TOKEN);
    const googleToken = localStorage.getItem(STORAGE_KEYS.GOOGLE_TOKEN);
    const microsoftToken = localStorage.getItem(STORAGE_KEYS.MICROSOFT_TOKEN);

    if (zoomToken) {
      headers["x-zoom-access-token"] = zoomToken;
    }

    if (googleToken) {
      headers["x-google-access-token"] = googleToken;
    }

    if (microsoftToken) {
      headers["x-microsoft-access-token"] = microsoftToken;
    }

    const response = await api.post(
      "/meetings/sync",
      {},
      {
        headers,
      }
    );

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

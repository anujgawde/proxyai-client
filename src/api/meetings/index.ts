import { CreateMeetingDto, QAEntry, Summary } from "@/types/meetings";
import { api } from "../api";

class MeetingsService {
  // Get all meetings for current user
  async getMyMeetings() {
    const response = await api.get("/meetings");
    return response.data;
  }

  // Create new meeting
  async createMeeting(meetingData: CreateMeetingDto) {
    const response = await api.post("/meetings", meetingData);
    return response.data;
  }

  // Get single meeting by ID
  async getMeetingById(id: string) {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  }

  async getMeetingTranscripts(id: string, page: number, limit: number) {
    const response = await api.get(
      `/meetings/${id}/transcripts?page=${page}&limit=${limit}`
    );

    return response.data;
  }

  // api/meetings.ts - Add these methods

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

  // No usage Yet:

  // Get meetings with query parameters
  async getMeetings(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/meetings", { params });
    return response.data;
  }

  // Update meeting
  // async updateMeeting(id: string, meetingData: UpdateMeetingDto) {
  //   const response = await api.patch(`/meetings/${id}`, meetingData);
  //   return response.data;
  // }

  // Delete meeting
  async deleteMeeting(id: string) {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  }

  // Cancel meeting (soft delete or status change)
  async cancelMeeting(id: string) {
    const response = await api.post(`/meetings/${id}/cancel`);
    return response.data;
  }

  // Join meeting
  async joinMeeting(id: string) {
    const response = await api.post(`/meetings/${id}/join`);
    return response.data;
  }

  // Leave meeting
  async leaveMeeting(id: string) {
    const response = await api.post(`/meetings/${id}/leave`);
    return response.data;
  }

  // Get meeting participants
  async getMeetingParticipants(id: string) {
    const response = await api.get(`/meetings/${id}/participants`);
    return response.data;
  }

  // Add participant to meeting
  async addParticipant(id: string, userId: string) {
    const response = await api.post(`/meetings/${id}/participants`, { userId });
    return response.data;
  }

  // Remove participant from meeting
  async removeParticipant(id: string, userId: string) {
    const response = await api.delete(`/meetings/${id}/participants/${userId}`);
    return response.data;
  }

  // Start meeting
  async startMeeting(id: number | string) {
    const response = await api.post(`/meetings/${id}/start`);
    return response.data;
  }

  // End meeting
  async endMeeting(id: number | string) {
    const response = await api.post(`/meetings/${id}/end`);
    return response.data;
  }
}

export const meetingsService = new MeetingsService();

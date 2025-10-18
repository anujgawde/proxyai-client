import { CreateMeetingDto, UpdateMeetingDto } from "@/types/meetings";
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
  async updateMeeting(id: string, meetingData: UpdateMeetingDto) {
    const response = await api.patch(`/meetings/${id}`, meetingData);
    return response.data;
  }

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

  async startMeeting(id: number) {}

  async endMeeting(id: number) {}
}

export const meetingsService = new MeetingsService();

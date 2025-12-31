import { UpdateUserDto } from "@/types/user";
import { api } from "../api";

class UsersService {
  // Get current user's profile
  async getUserProfile() {
    const response = await api.get("/users/me");
    return response.data;
  }

  // Update current user's profile
  async updateUserProfile(updatedUserData: UpdateUserDto) {
    const response = await api.patch("/users/me", updatedUserData);
    return response.data;
  }

  // No usage yet:
  // Get user profile by ID
  async getUserProfileById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Delete current user's account
  async deleteMyAccount() {
    const response = await api.delete("/users/me");
    return response.data;
  }
}

export const usersService = new UsersService();

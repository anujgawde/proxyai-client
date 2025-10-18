import { api } from "../api";
interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

class UsersService {
  // Get current user's profile
  async getMyProfile() {
    const response = await api.get("/users/me");
    return response.data;
  }

  // Update current user's profile
  async updateMyProfile(updatedUserData: UpdateUserDto) {
    const response = await api.patch("/users/me", updatedUserData);
    return response.data;
  }

  // No usage yet:

  // Get user profile by ID
  async getUserProfile(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Delete current user's account
  async deleteMyAccount() {
    const response = await api.delete("/users/me");
    return response.data;
  }

  // Update user profile by ID (admin functionality)
  async updateUserProfile(id: string, updatedUserData: UpdateUserDto) {
    const response = await api.patch(`/users/${id}`, updatedUserData);
    return response.data;
  }

  // Get all users (admin functionality)
  async getAllUsers() {
    const response = await api.get("/users");
    return response.data;
  }
}

export const usersService = new UsersService();

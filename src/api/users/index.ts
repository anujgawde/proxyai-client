import { UpdateUserDto } from "@/types/user";
import { api } from "../api";

class UsersService {
  async getUserProfile() {
    const response = await api.get("/users/me");
    return response.data;
  }

  async updateUserProfile(updatedUserData: UpdateUserDto) {
    const response = await api.patch("/users/me", updatedUserData);
    return response.data;
  }

  async getUserProfileById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async deleteMyAccount() {
    const response = await api.delete("/users/me");
    return response.data;
  }
}

export const usersService = new UsersService();

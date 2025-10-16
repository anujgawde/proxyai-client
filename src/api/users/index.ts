import { auth } from "@/lib/firebase";
import { authService } from "../auth";
import { api } from "../api";

class UsersService {
  async getUserProfile(firebaseUid: string) {
    const userData = await api.get(`/users/${firebaseUid}`);
    return userData.data;
  }

  async updateUserProfile(data: any) {
    const headers = await authService.getAuthHeaders();

    const userProfileData = await api.patch("/users/me", data, { headers });

    return userProfileData.data;
  }
}

export const usersService = new UsersService();

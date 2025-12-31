import { SignUpDto } from "@/types/auth";
import { api } from "../api";

class AuthService {
  async signUp(signUpData: SignUpDto) {
    try {
      const response = await api.post("/users/sign-up", signUpData);
      return response.data;
    } catch (error) {
      console.error("Sign-up failed:", error);
      throw error;
    }
  }

  async googleSignIn(signUpData: SignUpDto) {
    try {
      const response = await api.post("/users/google-sign-in", signUpData);
      return response.data;
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      console.error("Refresh failed:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();

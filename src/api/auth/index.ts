import { auth } from "@/lib/firebase";
import { api } from "../api";
import { User, UserMetadata } from "firebase/auth";
import { sign } from "crypto";

interface SignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string | null;
  metadata: UserMetadata;
  firebaseUid: string;
  emailVerified: boolean;
  authProvider: string;
}

class AuthService {
  async getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async signUp(signUpData: SignUpDto) {
    try {
      const headers = await this.getAuthHeaders();
      console.log("Auth headers:", headers);
      const signUpResponse = await api.post("/users/sign-up", signUpData, {
        headers,
      });

      return signUpResponse.data;
    } catch (error) {
      console.error("Sign-up failed:", error);
      throw error;
    }
  }

  async googleSignIn(signUpData: SignUpDto) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await api.post("/users/google-sign-in", signUpData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  }

  // Todo: If there's any logic for sign in with email and password, add here.

  // async upsertUser(email: string, displayName?: string) {
  //   try {
  //     const headers = await this.getAuthHeaders();

  //     const syncUserResponse = await api.post(
  //       "/users/sign-up",
  //       {
  //         email,
  //         displayName: displayName || "",
  //       },
  //       { headers }
  //     );
  //     console.log("Sync user response:", syncUserResponse);
  //     if (syncUserResponse.status !== 200) {
  //       throw new Error(
  //         `HTTP ${syncUserResponse.status}: ${syncUserResponse.statusText}`
  //       );
  //     }

  //     return syncUserResponse.data;
  //   } catch (error) {
  //     console.error("Backend sync failed:", error);
  //     throw error;
  //   }
  // }

  async getUserProfile() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.API_BASE_URL}/users/me`, {
      method: "GET",
      headers,
    });
    return response.json();
  }

  async updateUserProfile(data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.API_BASE_URL}/users/me`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const authService = new AuthService();

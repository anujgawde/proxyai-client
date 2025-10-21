// lib/socketService.ts

import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private isInitialized: boolean = false;

  initialize(userEmail: string) {
    if (this.isInitialized) {
      console.log("Socket service already initialized");
      return;
    }

    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    const apiUrl = process.env.API_BASE_URL;

    console.log("Initializing socket connection to:", apiUrl);

    this.socket = io(apiUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.isConnected = true;
      this.socket?.emit("register-user", { email: userEmail });
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("user-registered", (data) => {
      console.log("User registered:", data);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.isInitialized = true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isInitialized = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Meeting-specific methods
  joinMeeting(meetingId: string, userEmail: string) {
    this.socket?.emit("join-meeting", { meetingId, userEmail });
  }

  leaveMeeting(meetingId: string, userEmail: string) {
    this.socket?.emit("leave-meeting", { meetingId, userEmail });
  }

  updateRecordingStatus(
    meetingId: string,
    userId: string,
    isRecording: boolean
  ) {
    this.socket?.emit("update-recording-status", {
      meetingId,
      userId,
      isRecording,
      timestamp: new Date().toISOString(),
    });
  }

  sendTranscriptUpdate(
    meetingId: string,
    speaker: string,
    text: string,
    timestamp?: string
  ) {
    this.socket?.emit("transcript-update", {
      meetingId,
      speaker,
      text,
      timestamp: timestamp || new Date().toISOString(),
    });
  }

  askQuestion(meetingId: number, question: string, userEmail: string) {
    if (this.socket) {
      console.log(`Asking question in meeting ${meetingId}: ${question}`);
      this.socket.emit("ask-question", { meetingId, question, userEmail });
    }
  }

  // Event listeners
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

export const socketService = new SocketService();

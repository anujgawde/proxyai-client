"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  Play,
  Square,
  FileText,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  Radio,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { meetingsService } from "@/api/meetings";
import { Meeting } from "@/types/meetings";
import { useAuth } from "@/contexts/AuthContext";
import { socketService } from "@/lib/socket";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();

  const id = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Meeting controls
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Jitsi
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Speech Recognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchMeetingDetails();

    return () => {
      // Jitsi Cleanup / Unmount
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      // Stop recording if active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [id]);

  // Initialize socket
  useEffect(() => {
    if (!currentUser?.email) return;

    socketService.initialize(currentUser.email);
  }, [currentUser?.email]);

  // Socket listeners
  useEffect(() => {
    if (!meeting || !currentUser?.email) return;

    const socket = socketService.getSocket();
    if (!socket || !socket.connected) return;

    console.log("Setting up socket listeners for meeting:", id);

    // Track if we've already joined
    let hasJoined = false;

    const handleConnect = () => {
      if (!hasJoined) {
        socketService.joinMeeting(id, currentUser.email!);
        hasJoined = true;
      }
    };

    // Join if already connected, or wait for connection
    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    const handleMeetingStarted = (updatedMeeting: any) => {
      if (updatedMeeting.id === id) {
        console.log("Meeting started:", updatedMeeting);
        setMeeting(updatedMeeting);
        setIsMeetingStarted(true);
      }
    };

    const handleMeetingEnded = (updatedMeeting: any) => {
      if (updatedMeeting.id === id) {
        console.log("Meeting ended:", updatedMeeting);
        setMeeting(updatedMeeting);
        setIsMeetingStarted(false);
        if (isRecording) {
          stopRecording();
        }
      }
    };

    const handleNewTranscript = (entry: any) => {
      if (entry.meetingId === id) {
        console.log("New transcript entry:", entry);
        const timestamp = format(new Date(entry.timestamp), "HH:mm:ss");
        setTranscript((prev) => {
          // Prevent duplicates by checking if entry already exists
          const entryText = `[${timestamp}] ${entry.speaker}: ${entry.text}`;
          if (prev.includes(entryText)) {
            return prev;
          }
          return [...prev, entryText];
        });
      }
    };

    const handleUserJoined = ({ userEmail }: { userEmail: string }) => {
      console.log(`User ${userEmail} joined the meeting`);
    };

    const handleUserLeft = ({ userEmail }: { userEmail: string }) => {
      console.log(`User ${userEmail} left the meeting`);
    };

    socketService.on("meeting-started", handleMeetingStarted);
    socketService.on("meeting-ended", handleMeetingEnded);
    socketService.on("new-transcript", handleNewTranscript);
    socketService.on("user-joined-meeting", handleUserJoined);
    socketService.on("user-left-meeting", handleUserLeft);

    return () => {
      socketService.off("meeting-started", handleMeetingStarted);
      socketService.off("meeting-ended", handleMeetingEnded);
      socketService.off("new-transcript", handleNewTranscript);
      socketService.off("user-joined-meeting", handleUserJoined);
      socketService.off("user-left-meeting", handleUserLeft);
      socketService.off("connect", handleConnect);

      if (hasJoined) {
        socketService.leaveMeeting(id, currentUser.email!);
      }
    };
  }, [meeting?.id, currentUser?.email, isRecording]);

  useEffect(() => {
    // Jitsi initialization on meeting load
    if (meeting && jitsiContainerRef.current && !jitsiApiRef.current) {
      const loadJitsi = async () => {
        if (
          typeof window !== "undefined" &&
          !(window as any).JitsiMeetExternalAPI
        ) {
          const script = document.createElement("script");
          script.src = "https://meet.jit.si/external_api.js";
          script.async = true;
          script.onload = initializeJitsi;
          script.onerror = () => {
            console.error("Failed to load Jitsi Meet API");
            setError(
              "Failed to load video conferencing. Please refresh the page."
            );
          };
          document.head.appendChild(script);
        } else if ((window as any).JitsiMeetExternalAPI) {
          initializeJitsi();
        }
      };

      loadJitsi();
    }
  }, [meeting]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const meetingId = Array.isArray(id) ? id[0] : id;
      const data = await meetingsService.getMeetingById(meetingId!);
      setMeeting(data);
      setIsMeetingStarted(data.status === "ongoing");

      // Load existing transcripts
      if (data.transcript && data.transcript.length > 0) {
        const existingTranscripts = data.transcript.map((entry: any) => {
          const timestamp = format(new Date(entry.timestamp), "HH:mm:ss");
          return `[${timestamp}] ${entry.speaker}: ${entry.text}`;
        });
        setTranscript(existingTranscripts);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load meeting details");
      console.error("Error fetching meeting:", err);
    } finally {
      setLoading(false);
    }
  };

  const initializeJitsi = () => {
    if (!meeting || !jitsiContainerRef.current) return;

    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
    }

    const domain = "meet.jit.si";
    const options = {
      roomName: meeting.title,
      width: "100%",
      height: "100%",
      parentNode: jitsiContainerRef.current,
      userInfo: {
        email: currentUser?.email,
        displayName: currentUser?.email?.split("@")[0] || "User",
      },
      configOverwrite: {
        startWithAudioMuted: isMuted,
        startWithVideoMuted: isVideoOff,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "closedcaptions",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "chat",
          "recording",
          "livestreaming",
          "settings",
          "raisehand",
          "videoquality",
          "filmstrip",
          "stats",
          "shortcuts",
          "tileview",
          "help",
        ],
      },
    };

    jitsiApiRef.current = new (window as any).JitsiMeetExternalAPI(
      domain,
      options
    );

    jitsiApiRef.current.addListener("videoConferenceJoined", () => {
      console.log("Joined conference");
    });

    jitsiApiRef.current.addListener("videoConferenceLeft", () => {
      console.log("Left conference");
    });
  };

  const handleStartMeeting = async () => {
    try {
      await meetingsService.startMeeting(meeting!.id);
      setIsMeetingStarted(true);
      setMeeting({ ...meeting!, status: "ongoing" });
    } catch (err: any) {
      console.error("Error starting meeting:", err);
      alert("Failed to start meeting");
    }
  };

  const handleEndMeeting = async () => {
    if (!confirm("Are you sure you want to end this meeting?")) return;

    try {
      if (isRecording) {
        stopRecording();
      }
      await meetingsService.endMeeting(meeting!.id);
      router.push("/meetings");
    } catch (err: any) {
      console.error("Error ending meeting:", err);
      alert("Failed to end meeting");
    }
  };

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + " ";
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      // Show live typing effect for interim results
      if (interimTranscript) {
        const timestamp = format(new Date(), "HH:mm:ss");
        setLiveTranscript(
          `[${timestamp}] ${
            currentUser?.email || "Unknown"
          }: ${interimTranscript}`
        );
      } else if (!finalTranscript) {
        // Clear live transcript if no interim and no final
        setLiveTranscript("");
      }

      // Send final transcript and clear live display
      if (finalTranscript) {
        setLiveTranscript(""); // Clear live transcript immediately
        const timestamp = new Date().toISOString();

        socketService.sendTranscriptUpdate(
          id,
          currentUser?.email || "Unknown",
          finalTranscript.trim(),
          timestamp
        );

        socketService.updateRecordingStatus(
          id,
          currentUser?.email || "Unknown",
          true
        );
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        recognitionRef.current?.start();
      }
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current?.start();
      }
    };

    recognitionRef.current.start();
    setIsRecording(true);

    socketService.updateRecordingStatus(
      id,
      currentUser?.email || "Unknown",
      true
    );
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setLiveTranscript(""); // Clear any live transcript

    socketService.updateRecordingStatus(
      id,
      currentUser?.email || "Unknown",
      false
    );
  };

  const downloadTranscript = () => {
    const text = transcript.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting_${meeting?.id}_transcript_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleAudio");
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleVideo");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Meeting not found"}</p>
          <Button onClick={() => router.push("/meetings")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Button>
        </div>
      </div>
    );
  }

  const scheduledOnParts = meeting.scheduledOn.split("-");
  const scheduledOn = new Date(
    parseInt(scheduledOnParts[0]),
    parseInt(scheduledOnParts[1]) - 1,
    parseInt(scheduledOnParts[2])
  );
  const scheduledStart = new Date(meeting.scheduledStart);
  const scheduledEnd = new Date(meeting.scheduledEnd);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/meetings")}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {meeting.title}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(scheduledOn, "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(scheduledStart, "h:mm a")} -{" "}
                    {format(scheduledEnd, "h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {meeting.participants.length} participants
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {meeting.status === "ongoing" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <Radio className="w-3 h-3 mr-1 animate-pulse" />
                  Live
                </span>
              )}
              {!socketService.getConnectionStatus() && (
                <span className="text-xs text-gray-500">Connecting...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Jitsi Container */}
            <Card className="p-0">
              <CardContent className="p-0">
                <div
                  ref={jitsiContainerRef}
                  className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
                />
              </CardContent>
            </Card>

            {/* Meeting Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    {!isMeetingStarted ? (
                      <Button
                        onClick={handleStartMeeting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Meeting
                      </Button>
                    ) : (
                      <Button onClick={handleEndMeeting} variant="destructive">
                        <Phone className="h-4 w-4 mr-2" />
                        End Meeting
                      </Button>
                    )}

                    <Button
                      onClick={toggleMute}
                      variant={isMuted ? "destructive" : "outline"}
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      onClick={toggleVideo}
                      variant={isVideoOff ? "destructive" : "outline"}
                      title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                      {isVideoOff ? (
                        <VideoOff className="h-4 w-4" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        variant="outline"
                        disabled={!isMeetingStarted}
                        title="Start live transcription"
                      >
                        <Radio className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700"
                        title="Stop transcription"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants ({meeting.participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {meeting.participants.map((email, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 truncate">
                        {email}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Transcript */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Live Transcript
                    {isRecording && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                        Recording
                      </span>
                    )}
                  </CardTitle>
                  {transcript.length > 0 && (
                    <Button
                      onClick={downloadTranscript}
                      variant="ghost"
                      size="sm"
                      title="Download transcript"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {transcript.length === 0 && !liveTranscript ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      {isRecording
                        ? "Listening... Start speaking to see transcript"
                        : "Start recording to see live transcript"}
                    </p>
                  ) : (
                    <>
                      {liveTranscript && (
                        <div className="text-sm text-gray-700 p-2 bg-blue-50 rounded">
                          {liveTranscript}
                        </div>
                      )}
                      {transcript
                        .map((line, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-700 p-2 bg-gray-50 rounded"
                          >
                            {line}
                          </div>
                        ))
                        .reverse()}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Meeting Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Meeting Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {meeting.meetingRoomName && (
                  <div>
                    <span className="text-gray-500">Room:</span>
                    <p className="text-gray-900 font-medium">
                      {meeting.meetingRoomName}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Created by:</span>
                  <p className="text-gray-900">{meeting.createdBy}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="text-gray-900 capitalize">{meeting.status}</p>
                </div>
                {meeting.startedAt && (
                  <div>
                    <span className="text-gray-500">Started at:</span>
                    <p className="text-gray-900">
                      {format(new Date(meeting.startedAt), "h:mm a")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

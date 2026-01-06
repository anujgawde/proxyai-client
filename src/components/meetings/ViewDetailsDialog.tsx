"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  Target,
  Brain,
  Send,
  Bot,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MeetingListItem, Summary, QAEntry } from "@/types/meetings";
import { User as ProxyUser } from "@/types/user";
import { meetingsService } from "@/api/meetings";

interface TranscriptData {
  speakerEmail: string;
  speakerName: string;
  text: string;
  timestamp: string;
}

interface ViewDetailsDialogProps {
  isOpen: boolean;
  meeting: MeetingListItem;
  onClose: () => void;
  currentUser: ProxyUser;
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
  return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
};

export default function ViewDetailsDialog({
  isOpen,
  meeting,
  onClose,
  currentUser,
}: ViewDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    "transcripts" | "summaries" | "qa"
  >("transcripts");

  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptData[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  const [transcriptPage, setTranscriptPage] = useState(1);
  const [hasMoreTranscripts, setHasMoreTranscripts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Q&A State
  const [qaHistory, setQAHistory] = useState<QAEntry[]>([]);
  const [loadingQA, setLoadingQA] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qaPage, setQAPage] = useState(1);
  const [hasMoreQA, setHasMoreQA] = useState(false);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const summaryScrollRef = useRef<HTMLDivElement>(null);
  const qaContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  /* ---------------------------------- */
  /* SSE Connection for Live Updates    */
  /* ---------------------------------- */

  useEffect(() => {
    // Only connect SSE for live meetings
    if (!isOpen || !currentUser || meeting.status !== "live") {
      return;
    }

    // Connect to SSE for live updates
    const eventSource = new EventSource(
      `http://localhost:8001/meetings/sse?userId=${currentUser.firebaseUid}`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "transcript_update" && message.data) {
          const transcriptData = message.data;

          // Prepend new transcript (newest first)
          setTranscripts((prev) => [
            {
              speakerEmail: transcriptData.speaker_user_uuid || "",
              speakerName: transcriptData.speaker_name,
              text: transcriptData.transcription.transcript,
              timestamp: new Date(transcriptData.timestamp_ms).toISOString(),
            },
            ...prev,
          ]);
        }

        if (message.type === "summary_update" && message.data) {
          const summary = message.data;

          if (summary.meetingId === meeting.id) {
            // Prepend new summary (newest first)
            setSummaries((prev) => [summary, ...prev]);
          }
        }
      } catch (err) {
        console.error("ViewDetailsDialog SSE parse error:", err);
      }
    };

    eventSourceRef.current = eventSource;

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [isOpen, currentUser, meeting.id, meeting.status]);

  /* ---------------------------------- */
  /* Load Transcripts                   */
  /* ---------------------------------- */

  const loadTranscripts = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingTranscripts(true);
      }

      const response = await meetingsService.getMeetingTranscriptSegments(
        meeting.id.toString(),
        page,
        50
      );

      if (!response || !response.data) {
        if (!append) {
          setTranscripts([]);
        }
        setHasMoreTranscripts(false);
        return;
      }

      // Transform TranscriptSegment data to TranscriptData format
      const allSegments: TranscriptData[] = response.data.map(
        (segment: any) => ({
          speakerEmail: segment.speakerUserUuid || "",
          speakerName: segment.speakerName,
          text: segment.transcript,
          timestamp: new Date(parseInt(segment.timestampMs)).toISOString(),
        })
      );

      if (append) {
        setTranscripts((prev) => [...prev, ...allSegments]);
      } else {
        setTranscripts(allSegments);
      }

      setHasMoreTranscripts(response.pagination?.hasMore || false);
      setTranscriptPage(page);
    } catch (error) {
      console.error("Error loading transcripts:", error);
      if (!append) {
        setTranscripts([]);
        setHasMoreTranscripts(false);
      }
    } finally {
      setLoadingTranscripts(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTranscripts = () => {
    if (!loadingMore && hasMoreTranscripts) {
      loadTranscripts(transcriptPage + 1, true);
    }
  };

  useEffect(() => {
    if (isOpen && meeting?.id) {
      setTranscriptPage(1);
      loadTranscripts(1, false);
    }
  }, [isOpen, meeting?.id]);

  /* ---------------------------------- */
  /* Load Summaries                     */
  /* ---------------------------------- */

  const loadSummaries = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingSummaries(true);
      }

      const response = await meetingsService.getMeetingSummaries(
        meeting.id.toString(),
        page,
        10
      );
      console.log(response.data);
      if (!response || !response.data) {
        if (!append) {
          setSummaries([]);
        }
        return;
      }

      if (append) {
        setSummaries((prev) => [...prev, ...response.data]);
      } else {
        setSummaries(response.data);
      }
    } catch (error) {
      console.error("Error loading summaries:", error);
      if (!append) {
        setSummaries([]);
      }
    } finally {
      setLoadingSummaries(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen && meeting?.id) {
      loadSummaries(1, false);
    }
  }, [isOpen, meeting?.id]);

  /* ---------------------------------- */
  /* Load Q&A History                   */
  /* ---------------------------------- */

  const loadQAHistory = async (page: number, append: boolean = false) => {
    try {
      if (append) {
        // Loading more is handled differently for Q&A
      } else {
        setLoadingQA(true);
      }

      const response = await meetingsService.getQAHistory(
        meeting.id.toString(),
        page,
        10
      );

      if (!response || !response.data) {
        if (!append) {
          setQAHistory([]);
        }
        setHasMoreQA(false);
        return;
      }

      if (append) {
        setQAHistory((prev) => [...prev, ...response.data]);
      } else {
        setQAHistory(response.data);
      }

      setHasMoreQA(response.pagination?.hasMore || false);
      setQAPage(page);
    } catch (error) {
      console.error("Error loading Q&A history:", error);
      if (!append) {
        setQAHistory([]);
        setHasMoreQA(false);
      }
    } finally {
      setLoadingQA(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || isSubmitting) return;

    const question = currentQuestion.trim();
    setCurrentQuestion(""); // Clear input immediately
    setIsSubmitting(true);

    // Optimistically add question to UI
    const tempQA: QAEntry = {
      id: `temp-${Date.now()}`,
      userId: currentUser.firebaseUid,
      meetingId: meeting.id.toString(),
      speakerName: "You",
      speakerEmail: "",
      question: question,
      answer: "",
      timestamp: new Date().toISOString(),
      status: "asking",
      sources: [],
    };

    setQAHistory((prev) => [tempQA, ...prev]);

    try {
      const result = await meetingsService.askQuestion(
        meeting.id.toString(),
        question
      );

      // Replace temp entry with real result
      setQAHistory((prev) =>
        prev.map((qa) =>
          qa.id === tempQA.id ? { ...result, status: "answered" } : qa
        )
      );

      // Auto-scroll to top to show new answer
      if (qaContainerRef.current) {
        qaContainerRef.current.scrollTop = 0;
      }
    } catch (error: any) {
      console.error("Error asking question:", error);

      // Update temp entry to show error
      setQAHistory((prev) =>
        prev.map((qa) =>
          qa.id === tempQA.id
            ? {
                ...qa,
                status: "error",
                answer: error.message || "Failed to generate answer",
              }
            : qa
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen && meeting?.id) {
      loadQAHistory(1, false);
    }
  }, [isOpen, meeting?.id]);

  /* ---------------------------------- */
  /* Auto-scroll for new transcripts    */
  /* ---------------------------------- */

  useEffect(() => {
    if (activeTab === "transcripts" && transcriptScrollRef.current) {
      // Only auto-scroll if user is near the top (viewing latest)
      const scrollTop = transcriptScrollRef.current.scrollTop;
      if (scrollTop < 100) {
        transcriptScrollRef.current.scrollTop = 0;
      }
    }
  }, [transcripts, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 gap-0 w-2xl max-h-[80%] h-[80%] flex flex-col"
        style={{ maxWidth: "none" }}
      >
        <DialogHeader className="flex items-center flex-row px-6 py-4 space-x-2 border-b">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex-col flex">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {meeting.title}
            </DialogTitle>
            <div className="flex items-center space-x-3">
              <Badge
                className={`capitalize ${
                  meeting.status === "live"
                    ? "bg-red-50 text-red-700 border-red-200 text-xs"
                    : meeting.status === "scheduled"
                    ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 text-xs"
                }`}
              >
                {meeting.status}
              </Badge>
              <span className="text-xs text-gray-600">
                {new Date(meeting.startTime).toLocaleString()}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex border-b border-gray-200 bg-white w-full">
          <button
            className={`w-1/3 px-6 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === "transcripts"
                ? "border-slate-900 text-slate-900 bg-gray-50"
                : "border-transparent text-gray-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("transcripts")}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Transcripts ({transcripts?.length || 0})
          </button>
          <button
            className={`w-1/3 px-6 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === "summaries"
                ? "border-slate-900 text-slate-900 bg-gray-50"
                : "border-transparent text-gray-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("summaries")}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Summaries ({summaries?.length || 0})
          </button>
          <button
            className={`w-1/3 px-6 py-3 font-medium text-sm border-b-2 transition-all ${
              activeTab === "qa"
                ? "border-slate-900 text-slate-900 bg-gray-50"
                : "border-transparent text-gray-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("qa")}
          >
            <Brain className="h-4 w-4 inline mr-2" />
            Q&A
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "transcripts" && (
            <div className="h-full flex flex-col">
              <div
                ref={transcriptScrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-2"
              >
                {loadingTranscripts ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading transcripts...</p>
                  </div>
                ) : transcripts.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-slate-900 mb-1">
                      {meeting.status === "scheduled"
                        ? "Waiting for transcripts..."
                        : "No transcripts available"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {meeting.status === "scheduled"
                        ? "Transcripts will appear when the meeting starts"
                        : "Transcripts will appear as participants speak"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Reverse order - newest first */}
                    {transcripts.map((segment, index) => (
                      <div
                        key={`${segment.timestamp}-${index}`}
                        className="border-l-2 border-slate-200 pl-4 py-3 hover:border-slate-400 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {segment.speakerName || segment.speakerEmail}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(segment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {segment.text}
                        </p>
                      </div>
                    ))}

                    {hasMoreTranscripts && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={loadMoreTranscripts}
                          variant="outline"
                          size="sm"
                          disabled={loadingMore}
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More Transcripts"
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "summaries" && (
            <div className="h-full flex flex-col">
              <div
                ref={summaryScrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-3"
              >
                {loadingSummaries ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading summaries...</p>
                  </div>
                ) : summaries.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-slate-900 mb-1">
                      No summaries yet
                    </h3>
                    <p className="text-sm text-slate-500">
                      {meeting.status === "live"
                        ? "Summaries are generated every 2 minutes"
                        : meeting.status === "scheduled"
                        ? "Summaries will be generated when the meeting starts"
                        : "No summaries were generated for this meeting"}
                    </p>
                  </div>
                ) : (
                  /* Reverse order - newest first */
                  summaries.map((summary, index) => (
                    <div
                      key={summary.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500">
                          Summary #{summaries.length - index}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatTime(summary.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {summary.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "qa" && (
            <div className="flex flex-col h-full">
              {/* Q&A History Container */}
              <div
                ref={qaContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {loadingQA && qaHistory.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-sm text-slate-600">
                      Loading Q&A history...
                    </span>
                  </div>
                ) : qaHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-slate-900 mb-1">
                      No Questions Yet
                    </h3>
                    <p className="text-sm text-slate-500">
                      Ask a question about the meeting content below
                    </p>
                  </div>
                ) : (
                  <>
                    {qaHistory.map((qa, index) => (
                      <div key={qa.id} className="space-y-3">
                        {/* User Question */}
                        <div className="border-l-2 border-blue-500 pl-4 py-2">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium text-blue-600">
                              Your Question
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(qa.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-900">
                            {qa.question}
                          </p>
                        </div>

                        {/* AI Answer */}
                        <div className="ml-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start gap-2 mb-2">
                            {qa.status === "asking" && (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400 mt-0.5" />
                            )}
                            {qa.status === "answered" && (
                              <Bot className="h-4 w-4 text-slate-600 mt-0.5" />
                            )}
                            {qa.status === "error" && (
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <span className="text-xs font-medium text-slate-600">
                                {qa.status === "asking" && "Thinking..."}
                                {qa.status === "answered" && "AI Assistant"}
                                {qa.status === "error" && "Error"}
                              </span>
                              {qa.answer && (
                                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                                  {qa.answer}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Sources */}
                          {qa.sources && qa.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <span className="text-xs font-medium text-slate-500 block mb-2">
                                Sources from transcript:
                              </span>
                              <div className="space-y-1">
                                {qa.sources.map((source, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-slate-600 border-l-2 border-slate-300 pl-2 py-1"
                                  >
                                    {source}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Load More Button */}
                    {hasMoreQA && (
                      <div className="text-center py-4">
                        <button
                          onClick={() => loadQAHistory(qaPage + 1, true)}
                          className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                        >
                          Load More Questions
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Question Input Section (Fixed at Bottom) */}
              <div className="border-t border-slate-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion();
                      }
                    }}
                    placeholder="Ask a question about this meeting..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={!currentQuestion.trim() || isSubmitting}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Asking..." : "Ask"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Press Enter to send • Example: "What were the main discussion
                  points?"
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

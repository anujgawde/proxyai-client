"use client";
import {
  MeetingListItem,
  QAEntry,
  Summary,
  TranscriptData,
} from "@/types/meetings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  AlertCircle,
  Bot,
  Brain,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Target,
  User,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRef, useState, useEffect } from "react";
import { Input } from "../ui/input";

import { socketService } from "@/lib/socket";
import { User as ProxyUser } from "@/types/user";
import { meetingsService } from "@/api/meetings";

interface ViewDetailsDialogProps {
  isOpen: boolean;
  meeting: MeetingListItem;
  onClose: () => void;
  currentUser: ProxyUser;
}

export default function ViewDetailsDialog({
  isOpen,
  meeting,
  onClose,
  currentUser,
}: ViewDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    "transcripts" | "summaries" | "qa"
  >("transcripts");
  const [question, setQuestion] = useState("");
  const [qaHistory, setQAHistory] = useState<QAEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const summaryScrollRef = useRef<HTMLDivElement>(null);
  const qaScrollRef = useRef<HTMLDivElement>(null);

  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptData[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);

  // Pagination state
  const [transcriptPage, setTranscriptPage] = useState(1);
  const [hasMoreTranscripts, setHasMoreTranscripts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isReloadingRef = useRef(false);

  const openChangeHandler = () => {
    onClose();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Load transcripts from API with pagination
  const loadTranscripts = async (page: number, append: boolean = false) => {
    // Prevent concurrent reloads
    if (isReloadingRef.current) {
      console.log("Already reloading, skipping...");
      return;
    }

    try {
      isReloadingRef.current = true;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingTranscripts(true);
      }

      const response = await meetingsService.getMeetingTranscripts(
        meeting.id.toString(),
        page,
        1
      );

      console.log("Transcript API response:", response);

      if (!response || !response.data) {
        console.log("No response or data");
        if (!append) {
          setTranscripts([]);
        }
        setHasMoreTranscripts(false);
        return;
      }

      const allSegments: TranscriptData[] = response.data;
      console.log("Loaded segments:", allSegments);

      // Use functional updates to avoid stale state
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
      isReloadingRef.current = false;
    }
  };

  const loadMoreTranscripts = () => {
    if (!loadingMore && hasMoreTranscripts) {
      loadTranscripts(transcriptPage + 1, true);
    }
  };

  // Initial load of transcripts when dialog opens
  useEffect(() => {
    if (isOpen && meeting?.id) {
      setTranscriptPage(1);
      loadTranscripts(1, false);
    }
  }, [isOpen, meeting?.id]);

  // Listen ONLY for database flushes (remove live transcript listener)
  useEffect(() => {
    if (!meeting?.id) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleTranscriptsFlushed = (data: {
      meetingId: string;
      entryId: number;
      transcripts: TranscriptData[];
      timeStart: string;
      timeEnd: string;
    }) => {
      if (data.meetingId === meeting.id.toString()) {
        console.log("Transcripts flushed to database, reloading...", data);

        // Reload from page 1 to get the latest data
        loadTranscripts(1, false);
      }
    };

    socketService.on("transcripts-flushed", handleTranscriptsFlushed);

    return () => {
      socketService.off("transcripts-flushed", handleTranscriptsFlushed);
    };
  }, [meeting?.id]);

  const handleQuestionSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isSubmitting || !currentUser?.email) return;

    const questionText = question.trim();
    setQuestion("");
    setIsSubmitting(true);

    try {
      socketService.askQuestion(meeting.id, questionText, currentUser.email);
    } catch (error) {
      console.error("Error asking question:", error);
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  };

  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!meeting?.id) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    const handleTranscriptsFlushed = (data: {
      meetingId: string;
      entryId: number;
      transcripts: TranscriptData[];
      timeStart: string;
      timeEnd: string;
    }) => {
      if (data.meetingId === meeting.id.toString()) {
        console.log("Transcripts flushed to database", data);

        // Debounce reload to prevent rapid successive calls
        if (reloadTimeoutRef.current) {
          clearTimeout(reloadTimeoutRef.current);
        }

        reloadTimeoutRef.current = setTimeout(() => {
          console.log("Reloading transcripts after flush...");
          loadTranscripts(1, false);
        }, 500); // Wait 500ms before reloading
      }
    };

    socketService.on("transcripts-flushed", handleTranscriptsFlushed);

    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
      socketService.off("transcripts-flushed", handleTranscriptsFlushed);
    };
  }, [meeting?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={openChangeHandler}>
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
                  meeting.status === "ongoing"
                    ? "bg-red-50 text-red-700 border-red-200 text-xs"
                    : meeting.status === "scheduled"
                    ? "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 text-xs"
                }`}
              >
                {meeting.status}
              </Badge>
              <span className="text-xs text-gray-600">
                {meeting.participants.length} participants
              </span>
              {meeting.startedAt && (
                <span className="text-xs text-gray-600">
                  Started: {formatTime(meeting.startedAt)}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex border-b border-gray-200 bg-white w-full">
          <button
            className={`w-1/3 px-6 py-3 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "transcripts"
                ? "border-slate-900 text-slate-900 bg-gray-50"
                : "border-transparent text-gray-600 hover:text-slate-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("transcripts")}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Transcripts ({transcripts?.length || 0})
          </button>
          <button
            className={`w-1/3 px-6 py-3 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "summaries"
                ? "border-slate-900 text-slate-900 bg-gray-50"
                : "border-transparent text-gray-600 hover:text-slate-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("summaries")}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Summaries ({summaries?.length || 0})
          </button>
          <button
            className={`w-1/3 px-6 py-3 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "qa"
                ? "border-slate-900 text-slate-900 bg-gray-50"
                : "border-transparent text-gray-600 hover:text-slate-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("qa")}
          >
            <Brain className="h-4 w-4 inline mr-2" />
            Q&A ({qaHistory.length})
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "transcripts" && (
            <div className="h-full flex flex-col">
              <div
                ref={transcriptScrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-3"
              >
                {loadingTranscripts ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading transcripts...</p>
                  </div>
                ) : !transcripts || transcripts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-7 w-7 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No transcripts available yet
                    </h3>
                    {meeting.status === "scheduled" ? (
                      <p className="text-gray-600">
                        Transcripts will appear when the meeting starts
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        Transcripts will appear here after they are saved
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {transcripts.map((segment, index) => (
                      <Card
                        key={`${segment.timestamp}-${index}`}
                        className="border-l-4 border-l-slate-900 border border-gray-200 bg-white"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {!currentUser?.photoURL ? (
                                <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                  <img
                                    src={currentUser.photoURL}
                                    alt="User Avatar"
                                    className="w-6 h-6 rounded-full"
                                  />
                                </div>
                              )}
                              <span className="font-medium text-slate-900">
                                {segment.speakerName || segment.speakerEmail}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(segment.timestamp)}
                            </div>
                          </div>
                          <p className="text-gray-800 leading-relaxed">
                            {segment.text}
                          </p>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Load More Button */}
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
                {!summaries || summaries.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-7 w-7 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No summaries available yet
                    </h3>
                    {meeting.status === "ongoing" ? (
                      <p className="text-gray-600">
                        Summaries are generated every 2 minutes during the
                        meeting
                      </p>
                    ) : meeting.status === "scheduled" ? (
                      <p className="text-gray-600">
                        Summaries will be generated when the meeting starts
                      </p>
                    ) : null}
                  </div>
                ) : (
                  summaries.map((summary, index) => (
                    <Card
                      key={`${summary.timestamp}-${index}`}
                      className="border-l-4 border-l-slate-900 border border-gray-200 bg-white"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-slate-900 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Summary #{index + 1}
                          </CardTitle>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(summary.timestamp)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-800 leading-relaxed">
                          {summary.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "qa" && (
            <div className="h-full flex flex-col">
              <div
                ref={qaScrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {qaHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-7 w-7 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No questions asked yet
                    </h3>
                    <p className="text-gray-600">
                      Ask questions about the meeting content below and get
                      AI-powered answers
                    </p>
                  </div>
                ) : (
                  qaHistory.map((qa) => (
                    <div key={qa.id} className="space-y-3">
                      <Card className="border-l-4 border-l-blue-500 border border-gray-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {qa.userEmail === currentUser?.email
                                ? "You"
                                : qa.userEmail}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatTime(qa.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">
                            {qa.question}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500 ml-6 border border-gray-200 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-slate-900 flex items-center">
                              {qa.status === "asking" ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : qa.status === "error" ? (
                                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                              ) : (
                                <Bot className="w-4 h-4 mr-2 text-green-600" />
                              )}
                              AI Assistant
                              {qa.status === "answered" && (
                                <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                              )}
                            </span>
                          </div>

                          {qa.status === "asking" ? (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <span>Analyzing meeting content...</span>
                            </div>
                          ) : qa.status === "error" ? (
                            <p className="text-red-600 leading-relaxed">
                              {qa.answer}
                            </p>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-gray-800 leading-relaxed">
                                {qa.answer}
                              </p>
                              {qa.sources && qa.sources.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <p className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
                                    <Search className="w-3 h-3" />
                                    Sources from transcript:
                                  </p>
                                  <div className="space-y-1">
                                    {qa.sources.map((source, idx) => (
                                      <p
                                        key={idx}
                                        className="text-xs text-gray-600 leading-relaxed"
                                      >
                                        {source}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question about this meeting..."
                    disabled={isSubmitting}
                    className="flex-1 border-gray-200 focus:border-slate-900 focus:ring-slate-900/20"
                  />
                  <Button
                    onClick={() => handleQuestionSubmit()}
                    disabled={isSubmitting || !question.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 font-medium"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Questions will be answered using AI analysis of the meeting
                  transcripts
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

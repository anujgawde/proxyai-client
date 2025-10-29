"use client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QA_RESPONSES } from "@/lib/demo-data";

interface DemoMeeting {
  id: number;
  title: string;
  status: "scheduled" | "ongoing" | "ended";
  scheduledOn: string;
  scheduledStart: string;
  scheduledEnd: string;
  participants: string[];
  startedAt: string | null;
  endedAt: string | null;
  latestSummary: string | null;
}

interface TranscriptData {
  id: string;
  speakerName: string;
  speakerEmail: string;
  text: string;
  timestamp: string;
}

interface Summary {
  id: number;
  content: string;
  createdAt: string;
}

interface QAEntry {
  id: string;
  question: string;
  answer?: string;
  status: "asking" | "answered" | "error";
  speakerName: string;
  speakerEmail: string;
  timestamp: string;
  sources?: string[];
}

interface DemoViewDetailsDialogProps {
  isOpen: boolean;
  meeting: DemoMeeting;
  onClose: () => void;
  transcripts: TranscriptData[];
  summaries: Summary[];
}

const KEYWORD_MAP: Record<string, string[]> = {
  cause: ["cause", "root", "why", "reason", "problem"],
  timeline: ["timeline", "when", "sequence", "time", "chronology"],
  actions: ["action", "fix", "p0", "p1", "item", "task"],
  security: ["security", "secure", "protect", "encrypt", "auth"],
  risks: ["risk", "threat", "danger", "concern", "issue"],
  quantum: ["quantum", "qpu", "feasibility"],
  budget: ["budget", "cost", "money", "price", "dollar"],
};

const getQAResponse = (
  question: string,
  meetingId: number
): { answer: string; sources: string[] } => {
  const lowerQuestion = question.toLowerCase();
  const meetingResponses = QA_RESPONSES[meetingId];

  if (!meetingResponses) {
    return {
      answer:
        "I don't have information about this meeting yet. Please wait for transcripts to be generated.",
      sources: [],
    };
  }

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((keyword) => lowerQuestion.includes(keyword))) {
      if (meetingResponses[category]) {
        return meetingResponses[category];
      }
    }
  }

  return (
    meetingResponses.default || {
      answer:
        "I can answer questions about this meeting, but I need more specific keywords. Try asking about the cause, timeline, actions, or risks.",
      sources: [],
    }
  );
};

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

export default function DemoViewDetailsDialog({
  isOpen,
  meeting,
  onClose,
  transcripts,
  summaries,
}: DemoViewDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    "transcripts" | "summaries" | "qa"
  >("transcripts");
  const [question, setQuestion] = useState("");
  const [qaHistory, setQAHistory] = useState<QAEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const summaryScrollRef = useRef<HTMLDivElement>(null);
  const qaScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "transcripts" && transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop =
        transcriptScrollRef.current.scrollHeight;
    }
  }, [transcripts, activeTab]);

  useEffect(() => {
    if (activeTab === "qa" && qaScrollRef.current) {
      qaScrollRef.current.scrollTop = qaScrollRef.current.scrollHeight;
    }
  }, [qaHistory, activeTab]);

  const handleQuestionSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isSubmitting) return;

    const questionText = question.trim();
    const tempId = `qa-${Date.now()}`;
    setQuestion("");
    setIsSubmitting(true);

    const newQA: QAEntry = {
      id: tempId,
      question: questionText,
      status: "asking",
      speakerName: "You",
      speakerEmail: "demo@example.com",
      timestamp: new Date().toISOString(),
    };

    setQAHistory((prev) => [...prev, newQA]);

    setTimeout(() => {
      const response = getQAResponse(questionText, meeting.id);

      setQAHistory((prev) =>
        prev.map((qa) =>
          qa.id === tempId
            ? {
                ...qa,
                answer: response.answer,
                sources: response.sources,
                status: "answered" as const,
              }
            : qa
        )
      );
      setIsSubmitting(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  };

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
            Q&A ({qaHistory.length})
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "transcripts" && (
            <div className="h-full flex flex-col">
              <div
                ref={transcriptScrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-2"
              >
                {transcripts.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-slate-900 mb-1">
                      Waiting for transcripts...
                    </h3>
                    <p className="text-sm text-slate-500">
                      Transcripts will appear as participants speak
                    </p>
                  </div>
                ) : (
                  [...transcripts].reverse().map((segment) => (
                    <div
                      key={segment.id}
                      className="border-l-2 border-slate-200 pl-4 py-3 hover:border-slate-400 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-slate-900">
                          {segment.speakerName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatTime(segment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {segment.text}
                      </p>
                    </div>
                  ))
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
                {summaries.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-slate-900 mb-1">
                      No summaries yet
                    </h3>
                    <p className="text-sm text-slate-500">
                      Summaries generated every 30 seconds
                    </p>
                  </div>
                ) : (
                  [...summaries].reverse().map((summary, index) => (
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
            <div className="h-full flex flex-col">
              <div
                ref={qaScrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {qaHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-slate-900 mb-1">
                      No questions yet
                    </h3>
                    <p className="text-sm text-slate-500">
                      Ask questions about the meeting
                    </p>
                  </div>
                ) : (
                  [...qaHistory].reverse().map((qa) => (
                    <div key={qa.id} className="space-y-2">
                      <div className="border-l-2 border-blue-400 pl-4 py-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {qa.speakerName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(qa.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{qa.question}</p>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-4 py-3 ml-6 bg-slate-50 rounded-r">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                            {qa.status === "asking" ? (
                              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            ) : qa.status === "error" ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Bot className="w-4 h-4 text-slate-600" />
                            )}
                            AI Assistant
                          </span>
                        </div>

                        {qa.status === "asking" ? (
                          <p className="text-sm text-slate-500">
                            Analyzing meeting content...
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {qa.answer}
                            </p>
                            {qa.sources && qa.sources.length > 0 && (
                              <div className="border-t border-slate-200 pt-3 mt-3">
                                <p className="text-xs font-medium text-slate-500 mb-2">
                                  Sources:
                                </p>
                                <div className="space-y-1">
                                  {qa.sources.map((source, idx) => (
                                    <p
                                      key={idx}
                                      className="text-xs text-slate-600 pl-3 border-l border-slate-300"
                                    >
                                      {source}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-200 p-4 bg-white">
                <div className="flex space-x-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleQuestionSubmit()}
                    disabled={isSubmitting || !question.trim()}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Try: "What was the cause?" • "What's the timeline?" • "What
                  are the risks?"
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

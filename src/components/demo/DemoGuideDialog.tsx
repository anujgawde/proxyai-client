"use client";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DemoGuideDialogProps {
  autoOpen?: boolean;
}

export default function DemoGuideDialog({
  autoOpen = true,
}: DemoGuideDialogProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-slate-900 hover:bg-slate-800 z-50"
        size="icon"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              How to Use This Demo
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              Experience ProxyAI's meeting intelligence platform. Follow these
              steps to explore the demo.
            </p>

            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-700">
                  1
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-medium text-slate-900 mb-1">
                    Start a Meeting
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Click "Start Meeting" on any scheduled meeting to begin a
                    live simulation.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-700">
                  2
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-medium text-slate-900 mb-1">
                    Watch Real-Time Transcription
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Once started, the meeting goes live and transcription begins
                    automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-700">
                  3
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-medium text-slate-900 mb-1">
                    View Meeting Details
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Click &quot;View Details&quot; to access live transcripts, AI
                    summaries, and the Q&amp;A feature.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-700">
                  4
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-medium text-slate-900 mb-1">
                    Explore Multiple Sessions
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Start multiple meetings to see how ProxyAI handles
                    concurrent sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Try asking questions in the Q&A tab to see how our AI assistant
                would respond.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Note: Only mock data is used for the demo. To try a working
                version of the application, contact the developer:
                gawdeanuj@gmail.com
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 text-sm"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

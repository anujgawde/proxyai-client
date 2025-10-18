"use client";

import { Button } from "../ui/button";

interface MeetingsPageHeaderProps {
  setIsCreateMeetingDialogOpen: (open: boolean) => void;
}

export default function MeetingsPageHeader({
  setIsCreateMeetingDialogOpen,
}: MeetingsPageHeaderProps) {
  return (
    <div className="flex justify-between px-8 py-4 ">
      <p className="text-2xl font-medium">My Meetings</p>

      <Button
        onClick={() => setIsCreateMeetingDialogOpen(true)}
        className="bg-[#1e2738] rounded-full"
      >
        Schedule Meeting
      </Button>
    </div>
  );
}

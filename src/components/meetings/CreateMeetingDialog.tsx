"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { meetingsService } from "@/api/meetings";
import { CreateMeetingDto } from "@/types/meetings";

interface CreateMeetingDialogProps {
  isCreateMeetingDialogOpen: boolean;
  setIsCreateMeetingDialogOpen: (open: boolean) => void;
  onMeetingCreated?: () => void;
}

export function CreateMeetingDialog({
  isCreateMeetingDialogOpen,
  setIsCreateMeetingDialogOpen,
  onMeetingCreated,
}: CreateMeetingDialogProps) {
  const [title, setTitle] = useState<string>("");
  const [participants, setParticipants] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeFrom, setTimeFrom] = useState<string>("09:00");
  const [timeTo, setTimeTo] = useState<string>("10:00");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    participants: "",
    scheduledOn: "",
    timeRange: "",
    general: "",
  });

  const validateForm = () => {
    const newErrors = {
      title: "",
      participants: "",
      scheduledOn: "",
      timeRange: "",
      general: "",
    };

    if (!title.trim()) {
      newErrors.title = "Meeting title is required";
    }

    if (!participants.trim()) {
      newErrors.participants = "At least one participant email is required";
    } else {
      const participantsArray = participants
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      if (participantsArray.length === 0) {
        newErrors.participants = "At least one participant email is required";
      } else {
        const invalidEmails = participantsArray.filter(
          (email) => !/\S+@\S+\.\S+/.test(email)
        );

        if (invalidEmails.length > 0) {
          newErrors.participants = "Please enter valid email addresses";
        }
      }
    }

    if (!date) {
      newErrors.scheduledOn = "Please select a date";
    }

    if (timeFrom && timeTo && timeFrom >= timeTo) {
      newErrors.timeRange = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const resetForm = () => {
    setTitle("");
    setParticipants("");
    setDate(undefined);
    setTimeFrom("09:00");
    setTimeTo("10:00");
    setErrors({
      title: "",
      participants: "",
      scheduledOn: "",
      timeRange: "",
      general: "",
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const participantsArray = participants
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    // Create scheduled_start datetime
    const [startHours, startMinutes] = timeFrom.split(":");
    const scheduledStart = new Date(date!);
    scheduledStart.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    // Create scheduled_end datetime
    const [endHours, endMinutes] = timeTo.split(":");
    const scheduledEnd = new Date(date!);
    scheduledEnd.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    const year = date!.getFullYear();
    const month = String(date!.getMonth() + 1).padStart(2, "0");
    const day = String(date!.getDate()).padStart(2, "0");
    const scheduledOn = `${year}-${month}-${day}`;

    const payload: CreateMeetingDto = {
      title: title.trim(),
      participants: participantsArray,
      scheduledOn: scheduledOn,
      scheduledStart: scheduledStart.toISOString(),
      scheduledEnd: scheduledEnd.toISOString(),
    };

    try {
      setLoading(true);
      await meetingsService.createMeeting(payload);

      // Close dialog and reset form
      setIsCreateMeetingDialogOpen(false);
      resetForm();

      // Refresh meetings list
      if (onMeetingCreated) {
        onMeetingCreated();
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Failed to create meeting. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const openChangeHandler = () => {
    setIsCreateMeetingDialogOpen(!isCreateMeetingDialogOpen);
    if (isCreateMeetingDialogOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={isCreateMeetingDialogOpen} onOpenChange={openChangeHandler}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Meeting Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Meeting Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning"
              className={errors.title ? "border-red-300" : ""}
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label htmlFor="participants" className="text-sm font-medium">
              Participants
            </Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="e.g. jane@example.com, john@example.com"
              className={errors.participants ? "border-red-300" : ""}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Separate emails with commas
            </p>
            {errors.participants && (
              <p className="mt-1 text-xs text-red-600">{errors.participants}</p>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className={`w-full justify-between font-normal ${
                    errors.scheduledOn ? "border-red-300" : ""
                  }`}
                  disabled={loading}
                >
                  {date ? date.toLocaleDateString() : "Pick a date"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setDatePickerOpen(false);
                  }}
                  disabled={loading}
                />
              </PopoverContent>
            </Popover>
            {errors.scheduledOn && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduledOn}</p>
            )}
          </div>

          {/* Time Range Picker */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="time-from" className="text-sm font-medium">
                From
              </Label>
              <Input
                type="time"
                id="time-from"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${
                  errors.timeRange ? "border-red-300" : ""
                }`}
                disabled={loading}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="time-to" className="text-sm font-medium">
                To
              </Label>
              <Input
                type="time"
                id="time-to"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${
                  errors.timeRange ? "border-red-300" : ""
                }`}
                disabled={loading}
              />
            </div>
          </div>
          {errors.timeRange && (
            <p className="mt-1 text-xs text-red-600">{errors.timeRange}</p>
          )}

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {loading ? "Creating..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

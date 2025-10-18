"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersService } from "@/api/users";
import { Loader2 } from "lucide-react";
import { User } from "@/types/user";

export function ProfileSettings({ user }: { user: User }) {
  const [userData, setUserData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUpdatingProfile(true);
    await usersService.updateUserProfile(user.firebaseUid, userData);
    setIsUpdatingProfile(false);
  };

  const handleChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-start gap-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL ?? ""} alt="Profile" />
            <AvatarFallback className="text-lg bg-neutral-200 text-neutral-700">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label className="text-lg font-semibold text-neutral-900">
              {user.firstName} {user.lastName}
            </Label>
            {/* Todo: enable profile picture upload */}
            {/* <p className="text-xs text-neutral-600 mt-1">
              Click to edit your profile picture
            </p> */}
          </div>
        </div>

        {/* Name Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-semibold text-neutral-900"
            >
              First name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={userData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="max-w-md bg-white border-neutral-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-semibold text-neutral-900"
            >
              Last name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={userData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="max-w-md bg-white border-neutral-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            {isUpdatingProfile ? (
              <Loader2 className="animate-spin" />
            ) : (
              <p>Update profile</p>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Todo: Pass user data
export function ProfileSettings() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    const first = formData.firstName?.[0] || "";
    const last = formData.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* <div className="pb-4 border-b border-neutral-200">
        <h2 className="text-xl font-semibold text-neutral-900">
          Public profile
        </h2>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src="/placeholder.svg?height=64&width=64"
              alt="Profile"
            />
            <AvatarFallback className="text-lg bg-neutral-200 text-neutral-700">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label className="text-sm font-semibold text-neutral-900">
              Profile picture
            </Label>
            <p className="text-xs text-neutral-600 mt-1">
              Click to edit your profile picture
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-neutral-900"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="max-w-md bg-white border-neutral-300 focus:border-blue-500 focus:ring-blue-500"
          />
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
              value={formData.firstName}
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
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="max-w-md bg-white border-neutral-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <Button
            disabled
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            Update profile
          </Button>
        </div>
      </form>
    </div>
  );
}

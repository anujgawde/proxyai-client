// Todo: Change this to a server component. Find an alternative way to make user api call
"use client";
import { usersService } from "@/api/users";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { Loader2 } from "lucide-react";

import { useEffect, useState } from "react";

export default function SettingsProfilePage() {
  const [user, setUser] = useState(null);

  const getUserHandler = async () => {
    const response = await usersService.getUserProfile();
    setUser(response);
  };

  useEffect(() => {
    getUserHandler();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  return <ProfileSettings user={user} />;
}

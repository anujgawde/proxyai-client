"use client";

import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Todo: Make these links and create nested routes inside settings folder
const navItems = [{ id: "profile", label: "Profile", icon: User }];

export function SettingsNav() {
  const [activeItem, setActiveItem] = useState("profile");
  const { logout } = useAuth();
  const logoutHandler = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors font-normal cursor-pointer",
              activeItem === item.id
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-700 hover:bg-neutral-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}

      <div className="pt-4 mt-4 border-t border-neutral-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-normal cursor-pointer"
          onClick={logoutHandler}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}

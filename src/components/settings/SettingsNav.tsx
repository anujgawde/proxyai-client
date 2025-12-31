"use client";

import { User, LogOut, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      isTabActive: pathname.includes("/profile"),
    },
    {
      id: "providers",
      label: "Providers",
      icon: Video,
      isTabActive: pathname.includes("/providers"),
    },
  ];

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
            onClick={() => {
              router.push(`/settings/${item.id}`);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors font-normal cursor-pointer",
              item.isTabActive
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

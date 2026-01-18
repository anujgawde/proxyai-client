"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Bell, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const hiddenValue = pathname.includes("/auth");
    setIsHidden(hiddenValue);
  }, [pathname]);

  return (
    <div
      className={`bg-white border-b border-gray-200 items-center justify-between flex px-8 py-2 ${
        isHidden ? "hidden" : ""
      }`}
    >
      <div className="flex items-center justify-center text-2xl font-thin space-x-2 py-2">
        <Link href="/meetings">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
        </Link>
        <span className="text-2xl font-semibold text-primary">ProxyAI</span>
      </div>

      <div className="items-center space-x-2 flex">
        <div className="flex space-x-2 items-center">
          {/* <Button className="p-0" disabled variant={"ghost"}>
            <Bell />
          </Button> */}
        </div>
      </div>
    </div>
  );
}

"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Image from "next/image";
import { Target, User } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  const router = useRouter();

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
      <div className="flex items-center justify-center text-2xl text-[#003627] font-thin space-x-2 py-2">
        <Link href="/meetings">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
        </Link>
        <span className="text-2xl font-bold text-slate-900">ProxyAI</span>
      </div>

      <div className="items-center space-x-2 flex">
        <div className="flex space-x-2 items-center"></div>
      </div>
    </div>
  );
}

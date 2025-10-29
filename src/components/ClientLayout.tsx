"use client";

import { usePathname } from "next/navigation";
import Navbar from "./shared/Navbar";
import Sidebar from "./shared/sidebar/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  const showNavbars = pathname !== "/" && pathname !== "/auth";

  const showSidebar = showNavbars && pathname !== "/demo";

  return (
    <div className="flex flex-col h-full">
      {showNavbars && <Navbar />}

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}

        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

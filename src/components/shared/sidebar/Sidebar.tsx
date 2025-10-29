"use client";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import SideNavigationTab from "./SideNavigationTab";

export default function Sidebar() {
  const pathname = usePathname();
  const sideNavigationTabs = [
    {
      label: "Dashboard",
      navigateTo: "/dashboard",
      icon: <LayoutDashboard strokeWidth={1} />,
      isTabActive: pathname.includes("/dashboard"),
      isDisabled: true,
      placement: "top",
    },
    {
      label: "Meetings",
      navigateTo: "/meetings",
      icon: <Calendar strokeWidth={1} />,
      isTabActive: pathname.includes("/meetings"),
      isDisabled: false,
      placement: "top",
    },
    {
      label: "Settings",
      navigateTo: "/settings/profile",
      icon: <Settings strokeWidth={1} />,
      isTabActive: pathname.includes("/settings"),
      isDisabled: false,
      placement: "bottom",
    },
  ];

  const topTabs = sideNavigationTabs.filter((tab) => tab.placement === "top");
  const bottomTabs = sideNavigationTabs.filter(
    (tab) => tab.placement === "bottom"
  );

  return (
    <div
      className={`bg-white  px-3 flex-col items-center border-r border-gray-200 py-4 md:flex flex`}
    >
      {/* Top Tabs */}
      <div className="space-y-4">
        {topTabs.map((tab, index) => (
          <SideNavigationTab key={index} {...tab} />
        ))}
      </div>

      {/* Bottom Tabs */}
      <div className="space-y-4 mt-auto">
        {bottomTabs.map((tab, index) => (
          <SideNavigationTab key={index} {...tab} />
        ))}
      </div>
    </div>
  );
}

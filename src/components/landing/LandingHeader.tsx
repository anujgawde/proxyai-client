"use client";

import { Target } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function LandingHeader() {
  const router = useRouter();

  const handleNavigate = (url: string) => () => {
    router.push(url);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">ProxyAI</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#demo"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Demo
          </a>
          <Button
            onClick={handleNavigate("/auth")}
            variant="outline"
            size="sm"
            className="bg-transparent"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            Get Early Access
          </Button>
        </nav>
      </div>
    </header>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Brain, Clock, Bell, Users, Target } from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import RequestAccessDialog from "@/components/shared/RequestAccessDialog";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-slate-100 text-slate-700 hover:bg-slate-100">
            🚀 Now in Beta - Join the Waitlist
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 leading-tight text-balance">
            Stay on Top of Every Meeting Without Being in the Room
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed text-pretty">
            AI-powered live transcripts, summaries, and alerts — so you never
            miss a beat across multiple meetings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RequestAccessDialog />
            <a href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent"
              >
                See How It Works
              </Button>
            </a>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Marketing Sync</CardTitle>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600">
                    "Let's discuss the Q4 campaign strategy..."
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Product Review</CardTitle>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600">
                    "The new feature rollout is ahead of schedule..."
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Sales Standup</CardTitle>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600">
                    "Pipeline looks strong for this quarter..."
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-balance text-slate-900">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
              Everything you need to stay informed across all your meetings,
              powered by advanced AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">
                  Live Transcripts from Multiple Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  View ongoing transcripts from all your meetings in one unified
                  dashboard.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">AI-Powered Q&A</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Ask questions about any meeting; AI answers instantly using
                  RAG, or forwards to chat if context is missing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">
                  Auto Summaries Every 2 Minutes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Bite-sized updates delivered continuously, with full summaries
                  available anytime.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Attention Alerts</CardTitle>
                <Badge className="mt-2 bg-orange-100 text-orange-700 text-xs">
                  Coming Soon
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Get notified when you actually need to join a meeting.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black mb-6 text-balance text-slate-900">
            Turn Meetings Into Actionable Knowledge
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600 text-center">
                Skip meetings that don't need your presence.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Stay Informed</h3>
              <p className="text-gray-600 text-center">
                Get continuous AI summaries of all discussions.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Join When Needed</h3>
              <p className="text-gray-600 text-center">
                Jump into live discussions only when your attention is required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      {/* <section id="demo" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-black mb-6 text-balance text-slate-900">
            Your Meeting Command Center
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-pretty">
            Powered by AI
          </p>

          <div className="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">
              Interactive Demo Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              See ProxyAI in action with a live dashboard demonstration.
            </p>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              Request Demo Access
            </Button>
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      {/* <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-balance text-slate-900">
              Loved by Teams Everywhere
            </h2>
            <p className="text-xl text-gray-600 text-pretty">
              See what early users are saying about ProxyAI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                initials: "SJ",
                name: "Sarah Johnson",
                role: "Product Manager",
                quote:
                  "This tool saves me 10 hours a week! I can finally focus on what matters most.",
              },
              {
                initials: "MR",
                name: "Mike Rodriguez",
                role: "Engineering Lead",
                quote:
                  "Game changer for remote teams. Never miss important decisions again.",
              },
              {
                initials: "AL",
                name: "Anna Lee",
                role: "Marketing Director",
                quote:
                  "The AI summaries are incredibly accurate. It's like having a personal assistant.",
              },
            ].map((t) => (
              <Card
                key={t.name}
                className="border border-gray-200 shadow-lg text-left"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {t.initials}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <CardDescription>{t.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">"{t.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-balance text-slate-900">
              Flexible Plans for Teams and Individuals
            </h2>
            <p className="text-xl text-gray-600 text-pretty">
              Choose the plan that works best for your team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            Free
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription>
                  Perfect for trying out ProxyAI
                </CardDescription>
                <div className="text-3xl font-bold mt-4">
                  $0
                  <span className="text-base font-normal text-gray-600">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Up to 5 meetings/month",
                    "Basic transcripts",
                    "Email summaries",
                  ].map((f) => (
                    <li key={f} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-transparent"
                  variant="outline"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
            Pro
            <Card className="border-2 border-slate-900 relative hover:border-slate-700 transition-colors">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-900">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription>
                  For growing teams and power users
                </CardDescription>
                <div className="text-3xl font-bold mt-4">
                  $29
                  <span className="text-base font-normal text-gray-600">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Unlimited meetings",
                    "AI-powered Q&A",
                    "Real-time summaries",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
            Enterprise
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="text-3xl font-bold mt-4">Custom</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Dedicated support",
                    "Custom integrations",
                    "Advanced analytics",
                  ].map((f) => (
                    <li key={f} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-transparent"
                  variant="outline"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4 text-center text-gray-600">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-900">
                ProxyAI
              </span>
            </div>
            <div className="flex items-center gap-6">
              {/* <a href="#" className="hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-900">
                Contact
              </a> */}
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ProxyAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

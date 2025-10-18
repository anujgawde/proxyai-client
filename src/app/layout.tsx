import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "@/components/ClientLayout";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProxyAI - AI-Powered Meeting Intelligence",
  description:
    "Transform your meetings with AI-powered real-time transcription, summaries, and insights. Never miss important decisions again.",
  keywords: [
    "AI meetings",
    "transcription",
    "meeting summaries",
    "productivity",
    "collaboration",
  ],
  openGraph: {
    title: "ProxyAI - AI-Powered Meeting Intelligence",
    description:
      "Transform your meetings with AI-powered real-time transcription, summaries, and insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={`${geistSans.className} antialiased  w-full h-screen`}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            }
          >
            <ClientLayout>{children}</ClientLayout>
          </Suspense>
        </body>
      </AuthProvider>
    </html>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { STORAGE_KEYS } from "@/config";
import { ProviderConnection } from "@/types/providers";

// Provider definition
const PROVIDERS = [
  {
    id: "zoom" as const,
    name: "Zoom",
    description: "Connect your Zoom account to sync meetings",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#2D8CFF" />
        <path
          d="M16 18h8v12h-8V18zm10 0l8 6v-6h-8zm8 12l-8-6v6h8z"
          fill="white"
        />
      </svg>
    ),
    color: "bg-[#2D8CFF]",
    hoverColor: "hover:bg-[#2578E6]",
    borderColor: "border-[#2D8CFF]",
    bgLight: "bg-[#EBF5FF]",
    isDisabled: false,
  },
  {
    id: "gmeet" as const,
    name: "Google Meet",
    description: "Connect your Google account to sync meetings",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#00832D" />
        <path d="M24 14L14 20v8l10 6 10-6v-8l-10-6z" fill="#0066DA" />
        <path d="M34 20l-10 6v8l10-6v-8z" fill="#E94235" />
        <path d="M14 20v8l10 6v-8l-10-6z" fill="#2684FC" />
        <path d="M24 14v12l10-6-10-6z" fill="#00AC47" />
      </svg>
    ),
    color: "bg-[#00832D]",
    hoverColor: "hover:bg-[#007226]",
    borderColor: "border-[#00832D]",
    bgLight: "bg-[#E6F4EA]",
    isDisabled: false,
  },
  {
    id: "teams" as const,
    name: "Microsoft Teams",
    description: "Connect your Microsoft account to sync meetings",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#5059C9" />
        <path d="M28 16h8v16h-8V16z" fill="white" opacity="0.8" />
        <path d="M12 20h12v12H12V20z" fill="white" />
        <circle cx="30" cy="18" r="4" fill="white" />
      </svg>
    ),
    color: "bg-[#5059C9]",
    hoverColor: "hover:bg-[#464EB8]",
    borderColor: "border-[#5059C9]",
    bgLight: "bg-[#EEF0FF]",
    isDisabled: true,
  },
];

// Provider Settings Component
export default function ProviderSettings() {
  const [connections, setConnections] = useState<ProviderConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = () => {
    setLoading(true);

    // Check localStorage for tokens
    const providerConnections: ProviderConnection[] = PROVIDERS.map(
      (provider) => {
        const token = localStorage.getItem(`${provider.id}_access_token`);

        return {
          provider: provider.id,
          connected: !!token,
          connectedAt: token ? new Date().toISOString() : undefined,
        };
      }
    );

    setConnections(providerConnections);
    setLoading(false);
  };

  const handleConnect = async (providerId: string) => {
    setConnectingProvider(providerId);

    try {
      if (providerId === "zoom") {
        const oauthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}`;
        window.location.href = oauthUrl;
      }

      if (providerId === "gmeet") {
        const params = new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
          response_type: "code",
          scope: [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        });

        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      }
    } catch (error) {
      console.error(`Failed to connect to ${providerId}:`, error);
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId);

    if (
      !window.confirm(`Are you sure you want to disconnect ${provider?.name}?`)
    ) {
      return;
    }

    try {
      // Remove token from localStorage
      const storageKey =
        STORAGE_KEYS[
          `${providerId.toUpperCase()}_TOKEN` as keyof typeof STORAGE_KEYS
        ];
      localStorage.removeItem(storageKey);

      // Todo: Call backend to delete tokens

      loadProviders();
    } catch (error) {
      console.error(`Failed to disconnect from ${providerId}:`, error);
    }
  };

  const getProviderConnection = (providerId: string) => {
    return connections.find((c) => c.provider === providerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Meeting Providers
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          Connect your calendar services to sync meetings
        </p>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((provider) => {
          const connection = getProviderConnection(provider.id);
          const isConnected = connection?.connected || false;
          const isConnecting = connectingProvider === provider.id;

          return (
            <div
              key={provider.id}
              className={`bg-white rounded-lg border-2 transition-all ${
                isConnected ? `${provider.borderColor}` : "border-neutral-200"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{provider.logo}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-base font-semibold text-neutral-900">
                          {provider.name}
                        </Label>
                        {isConnected && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {provider.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isConnected ? (
                      <Button
                        onClick={() => handleDisconnect(provider.id)}
                        disabled={isConnecting}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={isConnecting || provider.isDisabled}
                        className={`${provider.color} ${provider.hoverColor} text-white cursor-pointer`}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">About provider connections</p>
            <ul className="space-y-1 text-blue-800 list-disc list-inside">
              <li>Your credentials are securely stored</li>
              <li>We only access your calendar data to sync meetings</li>
              <li>You can disconnect at any time</li>
              <li>Multiple providers can be connected simultaneously</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

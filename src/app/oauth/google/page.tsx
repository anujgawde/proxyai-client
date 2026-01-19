"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { providersService } from "@/api/providers";
import { useProvider } from "@/contexts/ProviderContext";

export default function GoogleOAuthPage() {
  const router = useRouter();
  const { refreshConnections } = useProvider();
  const hasExchanged = useRef(false);

  useEffect(() => {
    // Prevent double execution in React strict mode
    if (hasExchanged.current) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      router.replace("/settings/providers");
      return;
    }

    hasExchanged.current = true;

    const exchange = async () => {
      try {
        await providersService.exchangeCodeForTokens(code, "google");
        // Refresh connection status - don't await, let it happen in background
        // The settings page will also fetch status on mount
        refreshConnections().catch(() => {
          // Ignore errors - settings page will refresh on mount
        });
        router.replace("/settings/providers?connected=google");
      } catch (err) {
        console.error(err);
        router.replace("/settings/providers?error=connection_failed");
      }
    };

    exchange();
  }, [router, refreshConnections]);

  return null;
}

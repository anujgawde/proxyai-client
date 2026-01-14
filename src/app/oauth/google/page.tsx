"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { providersService } from "@/api/providers";

export default function GoogleOAuthPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      router.replace("/settings/providers");
      return;
    }

    const exchange = async () => {
      try {
        const res = await providersService.exchangeCodeForTokens(
          code,
          "google"
        );

        if (res.accessToken) {
          localStorage.setItem("google_access_token", res.accessToken);
        }
        router.replace("/settings/providers");
      } catch (err) {
        console.error(err);
        router.replace("/settings/providers");
      }
    };

    exchange();
  }, [router]);

  return null;
}

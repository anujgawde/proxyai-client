"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { providersService } from "@/api/providers";

export default function ZoomOAuthPage() {
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
        const res = await providersService.exchangeCodeForTokens(code, "zoom");

        localStorage.setItem("zoom_access_token", res.accessToken);

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

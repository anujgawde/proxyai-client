// hooks/useAuthRedirect.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthRedirect(redirectTo: string = "/meetings") {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push(redirectTo);
    }
  }, [currentUser, loading, router, redirectTo]);

  return { currentUser, loading };
}

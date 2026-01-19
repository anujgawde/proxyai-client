"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  providersService,
  ProviderConnectionStatus,
} from "@/api/providers";
import { useAuth } from "./AuthContext";

interface ProviderContextType {
  connections: ProviderConnectionStatus[];
  loading: boolean;
  refreshConnections: () => Promise<void>;
  updateConnectionStatus: (provider: string, connected: boolean) => void;
  isAnyProviderConnected: () => boolean;
}

const ProviderContext = createContext<ProviderContextType | undefined>(
  undefined
);

export function useProvider() {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error("useProvider must be used within a ProviderProvider");
  }
  return context;
}

export function ProviderProvider({ children }: { children: React.ReactNode }) {
  const [connections, setConnections] = useState<ProviderConnectionStatus[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const refreshConnections = useCallback(async () => {
    if (!currentUser) {
      setConnections([]);
      setLoading(false);
      return;
    }

    try {
      const status = await providersService.getConnectionStatus();
      setConnections(status);
    } catch (error) {
      console.error("Failed to fetch provider connection status:", error);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateConnectionStatus = useCallback(
    (provider: string, connected: boolean) => {
      setConnections((prev) =>
        prev.map((conn) =>
          conn.provider === provider
            ? { ...conn, connected, connectedAt: connected ? new Date().toISOString() : null }
            : conn
        )
      );
    },
    []
  );

  const isAnyProviderConnected = useCallback(() => {
    return connections.some((conn) => conn.connected);
  }, [connections]);

  // Fetch connection status when user logs in
  useEffect(() => {
    if (currentUser) {
      refreshConnections();
    } else {
      setConnections([]);
      setLoading(false);
    }
  }, [currentUser, refreshConnections]);

  const value: ProviderContextType = {
    connections,
    loading,
    refreshConnections,
    updateConnectionStatus,
    isAnyProviderConnected,
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
}

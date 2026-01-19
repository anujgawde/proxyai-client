import { api } from "../api";

export interface ProviderConnectionStatus {
  provider: string;
  connected: boolean;
  connectedAt: string | null;
}

class ProvidersService {
  async exchangeCodeForTokens(code: string, provider: string) {
    const response = await api.post(`/providers/callback`, { code, provider });
    return response.data;
  }

  async getConnectionStatus(): Promise<ProviderConnectionStatus[]> {
    const response = await api.get("/providers/status");
    return response.data;
  }

  async updateProvider(
    providerName: string,
    updateData: Record<string, unknown>
  ) {
    await api.patch(`/providers/${providerName}`, {
      ...updateData,
    });
  }
}

export const providersService = new ProvidersService();

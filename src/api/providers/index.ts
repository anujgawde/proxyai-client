import { api } from "../api";

class ProvidersService {
  async exchangeCodeForTokens(code: string, provider: string) {
    const response = await api.post(`/providers/callback`, { code, provider });
    return response.data;
  }

  async updateProvider(providerName: string, updateData: any) {
    const res = await api.patch(`/providers/${providerName}`, {
      ...updateData,
    });
  }
}

export const providersService = new ProvidersService();

import { api } from "../api";

class ProvidersService {
  async exchangeCodeForTokens(code: string, provider: string) {
    const response = await api.post(`/providers/callback`, { code, provider });
    return response.data;
  }
}

export const providersService = new ProvidersService();

export interface ProviderConnection {
  provider: "zoom" | "gmeet" | "teams";
  connected: boolean;
  connectedAt?: string;
}

export interface ProviderConnection {
  provider: "zoom" | "google_meet" | "teams";
  connected: boolean;
  connectedAt?: string;
}

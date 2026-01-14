export type CalendarProvider = "google" | "zoom" | "microsoft";
export type MeetingProvider = "google_meet" | "zoom" | "teams";

export interface ProviderConnection {
  provider: CalendarProvider;
  connected: boolean;
  connectedAt?: string;
}

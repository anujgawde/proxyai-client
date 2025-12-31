import { STORAGE_KEYS } from "@/config";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkProviderTokens() {
  return {
    zoom: !!localStorage.getItem(STORAGE_KEYS.ZOOM_TOKEN),
    gmeet: !!localStorage.getItem(STORAGE_KEYS.GMEET_TOKEN),
    teams: !!localStorage.getItem(STORAGE_KEYS.TEAMS_TOKEN),
  };
}

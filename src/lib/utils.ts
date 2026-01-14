import { STORAGE_KEYS } from "@/config";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkProviderTokens() {
  return {
    zoom: !!localStorage.getItem(STORAGE_KEYS.ZOOM_TOKEN),
    google: !!localStorage.getItem(STORAGE_KEYS.GOOGLE_TOKEN),
    microsoft: !!localStorage.getItem(STORAGE_KEYS.MICROSOFT_TOKEN),
  };
}

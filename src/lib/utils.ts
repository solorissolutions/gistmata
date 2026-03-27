import { clsx, type ClassValue } from "clsx";
import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string) {
  const date = parseISO(dateString);
  return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
}

export function formatTimelineDate(dateString: string) {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return `Today ${format(date, "HH:mm")}`;
  }

  if (isYesterday(date)) {
    return `Yesterday ${format(date, "HH:mm")}`;
  }

  return format(date, "dd MMM yyyy, HH:mm");
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function slugToLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

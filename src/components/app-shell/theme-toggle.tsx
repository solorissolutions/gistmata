"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/app-shell/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "nav-item justify-center xl:justify-start",
        compact ? "h-10 w-10 p-0" : ""
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-[26px] w-[26px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[26px] w-[26px]" aria-hidden="true" />
      )}
      {!compact && <span className="hidden xl:inline">Theme</span>}
    </button>
  );
}

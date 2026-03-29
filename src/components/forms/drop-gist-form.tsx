"use client";

import { useActionState, useEffect, useState } from "react";
import { MapPin, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";

import type { DraftAssistResponse } from "@/lib/ai/contracts";
import { Button } from "@/components/ui/button";
import { GIST_TAGS, MAX_GIST_LENGTH } from "@/lib/domain/constants";
import type { Viewer } from "@/lib/domain/types";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { submitGist } from "@/lib/server/mata-actions";

type ResolvedLocation = {
  displayLocality: string;
  areaBucket: string;
  admin2Name: string;
  admin2Type: string;
  stateName: string;
  confidenceScore: number;
  provider?: string;
  providerLabel?: string;
  fallbackUsed?: boolean;
};

function fromViewer(viewer: Viewer): ResolvedLocation | null {
  if (!viewer.location) {
    return null;
  }
  return viewer.location;
}

export function DropGistForm({ viewer }: { viewer: Viewer }) {
  const [state, action] = useActionState(submitGist, INITIAL_ACTION_STATE);
  const [bodyCount, setBodyCount] = useState(0);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("General");
  const [tagTouched, setTagTouched] = useState(false);
  const [draftAssist, setDraftAssist] = useState<DraftAssistResponse | null>(null);
  const [location, setLocation] = useState<ResolvedLocation | null>(() => fromViewer(viewer));
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "error">(
    fromViewer(viewer) ? "ready" : "idle"
  );
  const [online, setOnline] = useState(true);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  async function resolveWithCoords(coords?: { latitude?: number; longitude?: number }) {
    setLocationState("loading");
    setLocationMessage(null);

    try {
      const response = await fetch("/api/location/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords ?? {}),
      });

      if (!response.ok) {
        throw new Error("Location request no clear.");
      }

      const data = (await response.json()) as ResolvedLocation;
      setLocation(data);
      setLocationState("ready");
      setLocationMessage(
        data.fallbackUsed
          ? `Using ${data.stateName} fallback`
          : `Matched: ${data.displayLocality}`
      );
    } catch {
      setLocationState("error");
      setLocation(fromViewer(viewer));
      setLocationMessage(
        fromViewer(viewer)
          ? "Using saved posting area"
          : "Location unclear - try again"
      );
    }
  }

  useEffect(() => {
    const syncStatus = () => setOnline(window.navigator.onLine);
    syncStatus();
    window.addEventListener("online", syncStatus);
    window.addEventListener("offline", syncStatus);
    return () => {
      window.removeEventListener("online", syncStatus);
      window.removeEventListener("offline", syncStatus);
    };
  }, []);

  useEffect(() => {
    const trimmedBody = body.trim();

    if (trimmedBody.length < 12) {
      setDraftAssist(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/ai/draft-hints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: trimmedBody,
            currentTag: tag,
            context: "new-gist",
          }),
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as DraftAssistResponse;
        setDraftAssist(data);

        if (!tagTouched && data.tagSuggestion.confidence >= 0.74) {
          setTag(data.tagSuggestion.suggestedTag);
        }
      } catch {
        // Silent failure
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [body, tag, tagTouched]);

  async function requestLocation() {
    if (!navigator.geolocation) {
      await resolveWithCoords();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await resolveWithCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      async () => {
        await resolveWithCoords();
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  const canSubmit = online && location && locationState !== "loading" && body.trim().length > 0;

  return (
    <form action={action} className="flex flex-col">
      {/* Composer header - X style */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold">
            {viewer.username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Textarea */}
        <div className="min-w-0 flex-1">
          <textarea
            name="body"
            maxLength={MAX_GIST_LENGTH}
            placeholder="Wetin happen?"
            className="min-h-[120px] w-full resize-none border-none bg-transparent text-[20px] text-[var(--foreground)] placeholder:text-[var(--secondary)] focus:outline-none"
            onChange={(event) => {
              setBody(event.currentTarget.value);
              setBodyCount(event.currentTarget.value.length);
            }}
          />

          {/* Safety warnings */}
          {draftAssist?.safety.severity === "warn" && (
            <p className="mt-2 flex items-center gap-2 text-[14px] text-[var(--warning)]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {draftAssist.safety.reason}
            </p>
          )}
          {draftAssist?.safety.severity === "block" && (
            <p className="mt-2 flex items-center gap-2 text-[14px] text-[var(--destructive)]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {draftAssist.safety.reason}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-b border-[var(--border)]" />

      {/* Location bar */}
      <div className="flex items-center justify-between gap-3 py-2">
        <button
          type="button"
          onClick={requestLocation}
          disabled={locationState === "loading"}
          className="flex items-center gap-2 rounded-full text-[14px] font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--gm-green-soft)] px-3 py-1.5"
        >
          {locationState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="h-4 w-4" aria-hidden="true" />
          )}
          {location ? location.displayLocality : "Set location"}
        </button>
        
        {locationMessage && (
          <span className={`text-[13px] ${
            locationState === "error" ? "text-[var(--destructive)]" : "text-[var(--secondary)]"
          }`}>
            {locationMessage}
          </span>
        )}
      </div>

      {/* Tag selector */}
      <div className="flex items-center gap-3 py-2">
        <span className="text-[14px] text-[var(--secondary)]">Topic:</span>
        <select
          name="tag"
          className="h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] font-semibold text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          value={tag}
          onChange={(event) => {
            setTagTouched(true);
            setTag(event.currentTarget.value);
          }}
        >
          {GIST_TAGS.map((gistTag) => (
            <option key={gistTag} value={gistTag}>
              {gistTag}
            </option>
          ))}
        </select>
        {draftAssist?.tagSuggestion.confidence && draftAssist.tagSuggestion.confidence >= 0.58 && (
          <span className="text-[13px] text-[var(--secondary)]">
            Suggested: {draftAssist.tagSuggestion.suggestedTag}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="my-3 border-b border-[var(--border)]" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Character count */}
          <span className={`text-[13px] ${
            bodyCount > MAX_GIST_LENGTH * 0.9 ? "text-[var(--warning)]" : "text-[var(--secondary)]"
          }`}>
            {bodyCount}/{MAX_GIST_LENGTH}
          </span>
          
          {/* Connection status */}
          {!online && (
            <span className="flex items-center gap-1 text-[13px] text-[var(--destructive)]">
              <WifiOff className="h-4 w-4" aria-hidden="true" />
              Offline
            </span>
          )}
        </div>

        <Button type="submit" disabled={!canSubmit}>
          Drop Gist
        </Button>
      </div>

      {/* Hidden fields */}
      <input type="hidden" name="displayLocality" value={location?.displayLocality ?? ""} />
      <input type="hidden" name="areaBucket" value={location?.areaBucket ?? ""} />
      <input type="hidden" name="admin2Name" value={location?.admin2Name ?? ""} />
      <input type="hidden" name="admin2Type" value={location?.admin2Type ?? ""} />
      <input type="hidden" name="stateName" value={location?.stateName ?? viewer.homeState} />
      <input type="hidden" name="confidenceScore" value={String(location?.confidenceScore ?? 0.68)} />

      {/* Form status */}
      {state.message && (
        <p className={`mt-4 text-[14px] ${
          state.status === "error" ? "text-[var(--destructive)]" : "text-[var(--accent)]"
        }`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
